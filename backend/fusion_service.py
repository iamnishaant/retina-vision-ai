import os
import io
import json
import logging
from typing import Optional, Tuple, List, Any

import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F

from .preprocessing import resize_image, apply_clahe

from PIL import Image

logger = logging.getLogger(__name__)


# Minimal subset of classes from Testing_Fusion.py
import torch.nn as nn


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

        self.eff_proj = nn.Linear(1536, 512)
        self.conv_proj = nn.Linear(768, 512)
        self.swin_proj = nn.Linear(768, 512)
        self.rad_proj = nn.Linear(128, 512)

        self.cross_attn = nn.MultiheadAttention(embed_dim=512, num_heads=8, batch_first=True)
        self.cross_ln = nn.LayerNorm(512)

        self.ffn = nn.Sequential(
            nn.Linear(512, 256),
            nn.GELU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.GELU(),
            nn.LayerNorm(128),
        )

        self.cls_head = nn.Sequential(
            nn.Linear(128, 64),
            nn.GELU(),
            nn.Dropout(0.2),
            nn.Linear(64, 5),
        )

        if use_coral:
            self.coral_head = CORALHead(128, num_classes=5)

    def forward(self, eff, conv, swin, rad):
        eff = F.layer_norm(eff, eff.shape[1:])
        conv = F.layer_norm(conv, conv.shape[1:])
        swin = F.layer_norm(swin, swin.shape[1:])

        rad = self.rad_mlp(rad)
        q = self.rad_proj(rad).unsqueeze(1)

        eff_t = self.eff_proj(eff)
        conv_t = self.conv_proj(conv)
        swin_t = self.swin_proj(swin)

        kv = torch.stack([eff_t, conv_t, swin_t], dim=1)
        attn_out, _ = self.cross_attn(q, kv, kv)
        token = self.cross_ln(q + attn_out)
        fused = self.ffn(token).squeeze(1)

        logits = self.cls_head(fused)
        if self.use_coral:
            coral_logits = self.coral_head(fused)
            return logits, coral_logits, fused

        return logits, fused


# Singleton-style loader
_STATE = {
    "model": None,
    "device": "cuda" if torch.cuda.is_available() else "cpu",
}


def load_checkpoint(ckpt_path: str) -> None:
    if _STATE["model"] is not None:
        return

    if not os.path.exists(ckpt_path):
        raise FileNotFoundError(f"Checkpoint not found: {ckpt_path}")

    device = _STATE["device"]
    ckpt = torch.load(ckpt_path, map_location=device)
    rad_dim = ckpt["model"]["rad_mlp.0.weight"].shape[1]
    model = FusionModel(use_coral=True, rad_dim=rad_dim).to(device)
    model.load_state_dict(ckpt["model"])
    model.eval()
    _STATE["model"] = model
    logger.info("Fusion model loaded from %s", ckpt_path)


def _to_tensor(x: Any, device: Optional[str] = None) -> torch.Tensor:
    arr = np.asarray(x, dtype=np.float32)
    t = torch.tensor(arr, dtype=torch.float32)
    if device is None:
        device = _STATE["device"]
    return t.to(device)


def predict_from_embeddings(eff: List[float], conv: List[float], swin: List[float], rad: List[float]) -> dict:
    """Predict from precomputed modality embeddings + radiomics vector.

    eff: (1536,), conv: (768,), swin: (768,), rad: (rad_dim,)
    Returns: {pred, confidence, probs}
    """
    model = _STATE.get("model")
    if model is None:
        raise RuntimeError("Model not loaded. Call load_checkpoint() first.")

    eff_t = _to_tensor(eff).unsqueeze(0)
    conv_t = _to_tensor(conv).unsqueeze(0)
    swin_t = _to_tensor(swin).unsqueeze(0)
    rad_t = _to_tensor(rad).unsqueeze(0)

    with torch.no_grad():
        logits, _, _ = model(eff_t, conv_t, swin_t, rad_t)
        probs = F.softmax(logits, dim=1).cpu().numpy()[0]
        pred = int(probs.argmax())
        conf = float(probs.max())

    return {"pred": pred, "confidence": conf, "probs": probs.tolist()}


def _image_to_embedding_placeholder(img: Image.Image, target_dim: int) -> np.ndarray:
    """Simple deterministic image→embedding function.

    This uses a resized image (bilinear) and global average over RGB channels
    then projects to the requested dimensionality using a fixed random matrix.
    This is a lightweight fallback when pretrained backbone weights are not available.
    """
    arr = np.array(img.convert("RGB"), dtype=np.float32)
    arr = resize_image(arr)
    # global average pooling of HxW into 3 channels
    pooled = arr.mean(axis=(0, 1))  # (3,)
    rng = np.random.RandomState(0)
    proj = rng.normal(size=(3, target_dim)).astype(np.float32)
    emb = pooled.reshape(1, 3) @ proj
    return emb.ravel()


def predict_from_image_bytes(image_bytes: bytes, radiomics: Optional[List[float]] = None) -> dict:
    """Accepts a single image bytes (JPEG/PNG) and optional radiomics vector.

    Produces embeddings with a lightweight placeholder extractor and predicts.
    """
    from PIL import Image

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # placeholder embeddings matching expected dims
    eff_emb = _image_to_embedding_placeholder(img, 1536)
    conv_emb = _image_to_embedding_placeholder(img, 768)
    swin_emb = _image_to_embedding_placeholder(img, 768)

    # radiomics: if provided use, else zero-vector of model rad_dim
    model = _STATE.get("model")
    if model is None:
        raise RuntimeError("Model not loaded. Call load_checkpoint() first.")

    rad_dim = model.rad_mlp[0].in_features
    if radiomics is None:
        rad_vec = np.zeros(rad_dim, dtype=np.float32)
    else:
        rad_vec = np.asarray(radiomics, dtype=np.float32)
        if rad_vec.shape[0] != rad_dim:
            raise ValueError(f"Radiomics length {rad_vec.shape[0]} does not match model rad_dim {rad_dim}")

    return predict_from_embeddings(eff_emb, conv_emb, swin_emb, rad_vec)


def run_test(emb_eff_path: str, emb_conv_path: str, emb_swin_path: str, manifest_path: str, radiomics_path: str) -> dict:
    """Run evaluation similar to the original Testing_Fusion script.

    Paths should point to npz files for embeddings and CSVs for manifest and radiomics.
    Returns dictionary with accuracy, qwk and small subset metrics if computed.
    """
    # Lazy model check
    model = _STATE.get("model")
    if model is None:
        raise RuntimeError("Model not loaded. Call load_checkpoint() first.")

    # Load embeddings
    eff = np.load(emb_eff_path)["embeddings"]
    conv = np.load(emb_conv_path)["embeddings"]
    swin_npz = np.load(emb_swin_path)
    swin = swin_npz["embeddings"]

    manifest_df = pd.read_csv(manifest_path)
    manifest_df["image_id"] = manifest_df["image_id"].astype(str)

    rad_df = pd.read_csv(radiomics_path)
    rad_df["image_id"] = rad_df["image_id"].astype(str)

    # minimal reuse of Testing_Fusion dataset logic
    from torch.utils.data import Dataset, DataLoader

    class _DS(Dataset):
        def __init__(self, df):
            self.df = df.reset_index(drop=True).copy()
            self.labels = torch.tensor(self.df["numeric_label"].values, dtype=torch.long)
            self.eff = torch.tensor(eff, dtype=torch.float32)
            self.conv = torch.tensor(conv, dtype=torch.float32)
            self.swin = torch.tensor(swin, dtype=torch.float32)

            feature_cols = [c for c in rad_df.columns if c not in ["image_id", "numeric_label"]]
            rad_feat = rad_df.set_index("image_id")[feature_cols]
            zero = np.zeros(len(feature_cols), dtype=np.float32)
            rows = []
            for img_id in self.df["image_id"]:
                if img_id in rad_feat.index:
                    rows.append(rad_feat.loc[img_id].values)
                else:
                    rows.append(zero)
            self.rad = torch.tensor(np.stack(rows), dtype=torch.float32)

            if "original_index" in self.df.columns:
                self.idx = self.df["original_index"].values.astype(int)
            else:
                self.idx = self.df.index.values

        def __len__(self):
            return len(self.df)

        def __getitem__(self, i):
            mi = int(self.idx[i])
            return self.eff[mi], self.conv[mi], self.swin[mi], self.rad[i], self.labels[i]

    # split as in original script
    from sklearn.model_selection import train_test_split

    manifest_df = manifest_df.sort_values("image_id").reset_index(drop=True)
    labels = manifest_df["numeric_label"]

    train_df, temp_df = train_test_split(manifest_df, test_size=0.30, stratify=labels, random_state=42)
    val_df, test_df = train_test_split(temp_df, test_size=0.50, stratify=temp_df["numeric_label"], random_state=42)

    test_ds = _DS(test_df)
    test_loader = DataLoader(test_ds, batch_size=32, shuffle=False)

    # evaluate
    from sklearn.metrics import cohen_kappa_score

    all_preds, all_labels = [], []
    device = _STATE["device"]
    with torch.no_grad():
        for eff_b, conv_b, swin_b, rad_b, y in test_loader:
            eff_b = eff_b.to(device)
            conv_b = conv_b.to(device)
            swin_b = swin_b.to(device)
            rad_b = rad_b.to(device)
            logits, _, _ = model(eff_b, conv_b, swin_b, rad_b)
            probs = F.softmax(logits, dim=1)
            preds = probs.argmax(dim=1).cpu().numpy()
            all_preds.extend(preds)
            all_labels.extend(y.numpy())

    import numpy as _np
    all_preds = _np.array(all_preds)
    all_labels = _np.array(all_labels)
    acc = (all_preds == all_labels).mean()
    qwk = cohen_kappa_score(all_labels, all_preds, weights="quadratic")

    return {"accuracy": float(acc), "qwk": float(qwk)}
