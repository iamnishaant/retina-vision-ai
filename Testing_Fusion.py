import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

# -----------------------------
# Paths
# -----------------------------
EMB_EFF_PATH  = "/kaggle/working/week2/effnet_finetune/embeddings_effb3.npz"
EMB_CONV_PATH = "/kaggle/working/week2/convnext_finetune/embeddings_convnext.npz"
EMB_SWIN_PATH = "/kaggle/working/week2/swin_finetune/embeddings_swin.npz"

MANIFEST_PATH = "/kaggle/input/manifest-ddr-aligned/manifest_ddr_aligned.csv"
RADIOMICS_PATH = "/kaggle/working/radiomics_ddr_full.csv"

# -----------------------------
# Load embeddings
# -----------------------------
eff_emb  = np.load(EMB_EFF_PATH,  allow_pickle=True)["embeddings"]
conv_emb = np.load(EMB_CONV_PATH, allow_pickle=True)["embeddings"]
swin_npz = np.load(EMB_SWIN_PATH, allow_pickle=True)
swin_emb = swin_npz["embeddings"]
swin_ids = swin_npz.get("image_id", None)

print("Eff:", eff_emb.shape, " Conv:", conv_emb.shape, " Swin:", swin_emb.shape)

# -----------------------------
# Load manifest
# -----------------------------
manifest_df = pd.read_csv(MANIFEST_PATH)
manifest_df["image_id"] = manifest_df["image_id"].astype(str)

print("\nManifest rows:", len(manifest_df))

# -----------------------------
# Load radiomics
# -----------------------------
rad_df = pd.read_csv(RADIOMICS_PATH)
rad_df["image_id"] = rad_df["image_id"].astype(str)

# Identify columns
feature_cols = [c for c in rad_df.columns if c not in ["image_id", "numeric_label"]]

# Ensure correct dtype
rad_df[feature_cols] = rad_df[feature_cols].astype(np.float32)

# 🚀 Standardize ONLY radiomic features
scaler = StandardScaler()
rad_df[feature_cols] = scaler.fit_transform(rad_df[feature_cols]).astype(np.float32)

print("\nRadiomics rows:", len(rad_df))
print("Radiomics feature dim =", len(feature_cols))

# -----------------------------
# Consistency Check
# -----------------------------
print("\nCounts:")
print(" eff_emb:", eff_emb.shape[0])
print(" conv_emb:", conv_emb.shape[0])
print(" swin_emb:", swin_emb.shape[0])
print(" manifest:", len(manifest_df))

print("\nSample normalized radiomics row:")
print(rad_df.head(1).T)



import torch
import torch.nn as nn
import torch.nn.functional as F


class CORALHead(nn.Module):
    def __init__(self, in_features, num_classes=5):
        super().__init__()
        self.fc = nn.Linear(in_features, num_classes - 1)

    def forward(self, x):
        return self.fc(x)


class FusionModel(nn.Module):
    def __init__(self, use_coral=True, rad_dim=107):
        super().__init__()
        self.use_coral = use_coral

        # =====================================================
        # 1) RADIOMICS ENCODER → 128-d
        # =====================================================
        self.rad_mlp = nn.Sequential(
            nn.Linear(rad_dim, 512),
            nn.GELU(),
            nn.LayerNorm(512),
            nn.Dropout(0.3),

            nn.Linear(512, 256),
            nn.GELU(),
            nn.LayerNorm(256),
            nn.Dropout(0.3),

            nn.Linear(256, 128),
            nn.GELU(),
            nn.LayerNorm(128),
            nn.Dropout(0.3),
        )

        # =====================================================
        # 2) INDIVIDUAL PROJECTIONS (NO CONCAT)
        #    Each modality → 512-d token
        # =====================================================
        self.eff_proj  = nn.Linear(1536, 512)
        self.conv_proj = nn.Linear(768, 512)
        self.swin_proj = nn.Linear(768, 512)

        # Radiomics → Query token (512-d)
        self.rad_proj = nn.Linear(128, 512)

        # =====================================================
        # 3) CROSS-ATTENTION — Radiomics attends over 3 image tokens
        # =====================================================
        self.cross_attn = nn.MultiheadAttention(
            embed_dim=512,
            num_heads=8,       # 512/8 = 64 per head
            batch_first=True
        )
        self.cross_ln = nn.LayerNorm(512)

        # =====================================================
        # 4) FUSION FFN → 128-d latent
        # =====================================================
        self.ffn = nn.Sequential(
            nn.Linear(512, 256),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.GELU(),
            nn.LayerNorm(128),
        )

        # =====================================================
        # 5) CLASSIFIER + CORAL HEAD
        # =====================================================
        self.cls_head = nn.Sequential(
            nn.Linear(128, 64),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(64, 5),
        )

        if use_coral:
            self.coral_head = CORALHead(128, num_classes=5)


    def forward(self, eff, conv, swin, rad):

        # ------------------------
        # Normalize modality embeddings
        # ------------------------
        eff  = F.layer_norm(eff,  eff.shape[1:])
        conv = F.layer_norm(conv, conv.shape[1:])
        swin = F.layer_norm(swin, swin.shape[1:])

        # ------------------------
        # Radiomics latent → Query
        # ------------------------
        rad = self.rad_mlp(rad)
        q = self.rad_proj(rad).unsqueeze(1)         # (B,1,512)

        # ------------------------
        # Project image modalities → KV tokens
        # ------------------------
        eff_t  = self.eff_proj(eff)
        conv_t = self.conv_proj(conv)
        swin_t = self.swin_proj(swin)

        kv = torch.stack([eff_t, conv_t, swin_t], dim=1)  # (B,3,512)

        # ------------------------
        # Cross-attention (1×Q → 3×KV)
        # ------------------------
        attn_out, _ = self.cross_attn(q, kv, kv)
        token = self.cross_ln(q + attn_out)

        # ------------------------
        # Fused vector → 128
        # ------------------------
        fused = self.ffn(token).squeeze(1)          # (B,128)

        # ------------------------
        # Heads
        # ------------------------
        logits = self.cls_head(fused)

        if self.use_coral:
            coral_logits = self.coral_head(fused)
            return logits, coral_logits, fused

        return logits, fused




import torch

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print("Using device:", DEVICE)


# Load checkpoint first
CKPT_PATH = "/kaggle/input/week2-ansh-all-models-cnn/fusion_final_without_mean/fusion_best.pth"
ckpt = torch.load(CKPT_PATH, map_location=DEVICE, weights_only=False)

#  Infer rad_dim from checkpoint weights
rad_dim = ckpt["model"]["rad_mlp.0.weight"].shape[1]
print("✔ Radiomics dim from checkpoint:", rad_dim)

# Build model EXACTLY as trained
fusion_model = FusionModel(use_coral=True, rad_dim=rad_dim).to(DEVICE)
fusion_model.load_state_dict(ckpt["model"])
fusion_model.eval()

print(" Fusion model loaded correctly")


import numpy as np
import torch
from torch.utils.data import Dataset

class FusionDataset(Dataset):
    def __init__(self, split_df, eff_emb, conv_emb, swin_emb, rad_df):
        """
        split_df  : filtered manifest for train/val/test
        eff_emb   : EfficientNet embeddings  (N,1536)
        conv_emb  : ConvNeXt embeddings      (N,768)
        swin_emb  : Swin embeddings          (N,768)
        rad_df    : Radiomics dataframe      (rows ⊂ DDR, columns: image_id, numeric_label, radiomics...)
        """

        # -----------------------------
        # MANIFEST (keeps proper order)
        # -----------------------------
        self.df = split_df.reset_index(drop=True).copy()
        self.df["image_id"] = self.df["image_id"].astype(str)
        self.labels = torch.tensor(self.df["numeric_label"].values, dtype=torch.long)

        # -----------------------------
        # EMBEDDING MATRICES
        # -----------------------------
        self.eff_all  = torch.tensor(eff_emb,  dtype=torch.float32)
        self.conv_all = torch.tensor(conv_emb, dtype=torch.float32)
        self.swin_all = torch.tensor(swin_emb, dtype=torch.float32)

        # map row to original embedding index
        if "original_index" in self.df.columns:
            self.idx_in_manifest = self.df["original_index"].values.astype(int)
        else:
            self.idx_in_manifest = self.df.index.values

        # -----------------------------
        # RADIOMICS LOAD + ZERO IMPUTATION
        # -----------------------------
        rad_df = rad_df.copy()
        rad_df["image_id"] = rad_df["image_id"].astype(str)

        # radiomic feature columns (exclude image_id & numeric_label)
        feature_cols = [c for c in rad_df.columns if c not in ["image_id", "numeric_label"]]
        self.rad_dim = len(feature_cols)

        # ensure correct dtype
        rad_df[feature_cols] = rad_df[feature_cols].astype(np.float32)

        # set index by image_id for quick lookup
        rad_feat = rad_df.set_index("image_id")[feature_cols]

        # zero vector for missing samples
        zero_vec = np.zeros(self.rad_dim, dtype=np.float32)

        # build aligned radiomics in manifest order
        rad_rows = []
        missing = 0
        for img_id in self.df["image_id"]:
            if img_id in rad_feat.index:
                rad_rows.append(rad_feat.loc[img_id].values)
            else:
                rad_rows.append(zero_vec)
                missing += 1

        self.radiomics = torch.tensor(np.stack(rad_rows), dtype=torch.float32)

        print(f"[FusionDataset] {len(self.df)} samples | rad_dim={self.rad_dim} | missing radiomics filled={missing}")

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        mi = self.idx_in_manifest[idx]  # embedding index mapped correctly

        return (
            self.eff_all[mi],
            self.conv_all[mi],
            self.swin_all[mi],
            self.radiomics[idx],
            self.labels[idx],
        )

from sklearn.model_selection import train_test_split

manifest_df = manifest_df.sort_values("image_id").reset_index(drop=True)

labels = manifest_df["numeric_label"]

train_df, temp_df = train_test_split(
    manifest_df,
    test_size=0.30,
    stratify=labels,
    random_state=42
)

val_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    stratify=temp_df["numeric_label"],
    random_state=42
)

print("TOTAL:", len(manifest_df))
print("TRAIN:", len(train_df))
print("VAL:", len(val_df))
print("TEST:", len(test_df))
print("Ratios:",
      round(len(train_df)/len(manifest_df),3),
      round(len(val_df)/len(manifest_df),3),
      round(len(test_df)/len(manifest_df),3))


train_ds = FusionDataset(train_df, eff_emb, conv_emb, swin_emb, rad_df)
val_ds   = FusionDataset(val_df,   eff_emb, conv_emb, swin_emb, rad_df)
test_ds  = FusionDataset(test_df,  eff_emb, conv_emb, swin_emb, rad_df)

from torch.utils.data import DataLoader
train_loader = DataLoader(train_ds, batch_size=32, shuffle=True,  num_workers=2)
val_loader   = DataLoader(val_ds,   batch_size=32, shuffle=False, num_workers=2)
test_loader  = DataLoader(test_ds,  batch_size=32, shuffle=False, num_workers=2)


import torch
import torch.nn.functional as F
import numpy as np
from sklearn.metrics import cohen_kappa_score

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
NUM_CLASSES = 5
CORAL_ALPHA = 0.2

print("Using device:", DEVICE)

# ===========================
# CORAL HELPERS (same as training)
# ===========================
def coral_targets(y):
    k = torch.arange(NUM_CLASSES - 1, device=y.device).view(1, -1)
    return (y.view(-1, 1) > k).float()

def coral_loss(coral_logits, y):
    targets = coral_targets(y)
    return F.binary_cross_entropy_with_logits(coral_logits, targets)

# ===========================
# LOAD MODEL (EXACT ARCH)
# ===========================
#  FIX: rad_dim MUST match training (checkpoint expects 107)
rad_dim = 107

model = FusionModel(
    use_coral=True,
    rad_dim=rad_dim
).to(DEVICE)

CKPT_PATH = "/kaggle/input/week2-ansh-all-models-cnn/fusion_final_without_mean/fusion_best.pth"

print(" Loading checkpoint:", CKPT_PATH)
ckpt = torch.load(CKPT_PATH, map_location=DEVICE, weights_only=False)

model.load_state_dict(ckpt["model"])
model.eval()

print(" Fusion model loaded")
print("Best QWK stored:", ckpt.get("best_qwk"))

# ===========================
# EVALUATION ONLY (NO TRAINING)
# ===========================
def evaluate(model, loader):
    model.eval()
    all_preds, all_labels, all_conf = [], [], []

    with torch.no_grad():
        for eff, conv, swin, rad, y in loader:
            eff   = eff.to(DEVICE)
            conv  = conv.to(DEVICE)
            swin  = swin.to(DEVICE)
            rad   = rad.to(DEVICE)
            y     = y.to(DEVICE)

            logits, coral_logits, _ = model(eff, conv, swin, rad)

            probs = F.softmax(logits, dim=1)
            preds = probs.argmax(dim=1)

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(y.cpu().numpy())
            all_conf.extend(probs.max(dim=1).values.cpu().numpy())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)
    all_conf = np.array(all_conf)

    acc = (all_preds == all_labels).mean()
    qwk = cohen_kappa_score(all_labels, all_preds, weights="quadratic")

    return acc, qwk, all_preds, all_labels, all_conf

# ===========================
# RUN TEST
# ===========================
test_acc, test_qwk, y_pred, y_true, conf = evaluate(model, test_loader)

print("\n TEST RESULTS")
print(f"Test Accuracy: {test_acc:.4f}")
print(f"Test QWK     : {test_qwk:.4f}")


def clinical_decision(conf):
    if conf >= 0.85:
        return "Auto-accept (high confidence)"
    elif conf >= 0.65:
        return "Review recommended"
    else:
        return "Refer to specialist"


import pandas as pd
import torch.nn.functional as F
from collections import defaultdict

records = []
fusion_model.eval()

MAX_PER_CLASS = 100
class_counter = defaultdict(int)

with torch.no_grad():
    for eff, conv, swin, rad, y in test_loader:
        eff, conv, swin, rad = eff.to(DEVICE), conv.to(DEVICE), swin.to(DEVICE), rad.to(DEVICE)
        logits, _, _ = fusion_model(eff, conv, swin, rad)

        probs = F.softmax(logits, dim=1)
        conf, pred = probs.max(dim=1)

        for i in range(len(y)):
            true_g = int(y[i])
            if class_counter[true_g] >= MAX_PER_CLASS:
                continue

            confidence = float(conf[i])
            pred_g = int(pred[i])

            records.append({
                "True Grade": true_g,
                "Predicted Grade": pred_g,
                "Confidence": confidence,
                "Clinical Action": clinical_decision(confidence)
            })

            class_counter[true_g] += 1

        if all(class_counter[c] >= MAX_PER_CLASS for c in range(5)):
            break

vis_df = pd.DataFrame(records)
vis_df.head()


import numpy as np

vis_df = vis_df.copy()

# small horizontal jitter so points don't overlap
vis_df["jitter"] = np.random.uniform(-0.25, 0.25, size=len(vis_df))


import numpy as np

vis_df = vis_df.copy()

# small horizontal jitter so points don't overlap
vis_df["jitter"] = np.random.uniform(-0.25, 0.25, size=len(vis_df))


import plotly.express as px

fig = px.scatter(
    vis_df,
    x="jitter",                  # fake x for horizontal spread
    y="True Grade",              # groups all grades together
    size="Confidence",
    color="Visual Category",
    hover_data={
        "Predicted Grade": True,
        "Confidence": ":.3f",
        "Visual Category": True,
        "jitter": False
    },
    title="Clinical Decision Visualization — Confidence-Aware Error Highlighting",
    color_discrete_map={
        "Auto-accept (high confidence)": "#2ecc71",      # green
        "Review recommended": "#f1c40f",                 # yellow
        "Human expert required": "#e74c3c",              # red
        "High-confidence error (critical)": "#8e44ad"    #  purple/red highlight
    },
    size_max=18
)

fig.update_layout(
    xaxis=dict(
        visible=False,
        showticklabels=False
    ),
    yaxis=dict(
        tickmode="linear",
        title="True DR Grade"
    ),
    height=600
)

fig.show()
fig.write_html("eda/clinical_decision_by_grade_confidence_aware.html")


from sklearn.metrics import accuracy_score, cohen_kappa_score

small_acc = accuracy_score(
    vis_df["True Grade"],
    vis_df["Predicted Grade"]
)

small_qwk = cohen_kappa_score(
    vis_df["True Grade"],
    vis_df["Predicted Grade"],
    weights="quadratic"
)

print(" Metrics on Visualized Clinical Subset")
print(f"Accuracy : {small_acc:.4f}")
print(f"QWK      : {small_qwk:.4f}")


