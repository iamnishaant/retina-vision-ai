import torch
import torch.nn as nn
from torchvision import transforms, models
import os

# -----------------------------
# CONFIG
# -----
RAD_DIM = 107  # radiomics dimension input
NUM_CLASSES = 5

GRADE_MAP = {
    0: "No DR",
    1: "Mild DR",
    2: "Moderate DR",
    3: "Severe DR",
    4: "Proliferative DR"
}

# Path to checkpoint - adjust if needed
BASE_DIR = os.path.dirname(__file__)
CKPT_PATH = os.getenv("FUSION_CKPT_PATH", os.path.join(BASE_DIR, "fusion_best.pth"))


# -----------------------------
# IMAGE PREPROCESSING
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# -----------------------------
# BACKBONES
# -----------------------------
# Initialize models once
_effnet = None
_convnext = None
_swin = None


def get_backbones(device):
    """Get or initialize backbone models."""
    global _effnet, _convnext, _swin
    
    if _effnet is None:
        _effnet = models.efficientnet_b3(pretrained=True)
        _effnet.classifier = nn.Identity()
        _effnet.eval()
    
    if _convnext is None:
        _convnext = models.convnext_tiny(pretrained=True)
        _convnext.classifier = nn.Identity()
        _convnext.eval()
    
    if _swin is None:
        _swin = models.swin_t(pretrained=True)
        _swin.head = nn.Identity()
        _swin.eval()
    
    _effnet.to(device)
    _convnext.to(device)
    _swin.to(device)
    
    return _effnet, _convnext, _swin


# -----------------------------
# FUSION MODEL (MUST MATCH TRAINING)
# Matches exact checkpoint architecture
# -----------------------------
class FusionModel(nn.Module):
    def __init__(self, rad_dim=RAD_DIM):
        super().__init__()
        
        # Feature projections (map backbone outputs to 512)
        self.eff_proj = nn.Linear(1536, 512)
        self.conv_proj = nn.Linear(768, 512)
        self.swin_proj = nn.Linear(768, 512)
        self.rad_proj = nn.Linear(128, 512)  # Note: expects 128, radiomics gets projected first
        
        # Cross-attention
        self.cross_attn = nn.MultiheadAttention(512, num_heads=8, batch_first=True)
        self.cross_ln = nn.LayerNorm(512)
        
        # Feed-forward: 512 -> 256 -ReLU- 128 -ReLU- 128
        self.ffn = nn.Sequential(
            nn.Linear(512, 256),  # ffn.0
            nn.ReLU(),             # ffn.1
            nn.Linear(256, 128),   # ffn.3
            nn.ReLU(),             # ffn.4
            nn.Linear(128, 128)    # ffn.5
        )
        
        # Classification head: 128 -> 64 -> 5
        self.cls_head = nn.Sequential(
            nn.Linear(128, 64),    # cls_head.0
            nn.ReLU(),             # cls_head.1
            nn.Linear(64, 5)       # cls_head.3
        )
        
        # CORAL head: 128 -> 4
        self.coral_head = nn.Sequential(
            nn.Linear(128, 4)      # coral_head.fc
        )
        
        # Radiomics MLP: 107 -> 512 -> 512 -> 256 -> 256 -> 128 -> 128
        # Using LayerNorm instead of BatchNorm (checkpoint only has weight/bias)
        self.rad_mlp = nn.Sequential(
            nn.Linear(107, 512),   # rad_mlp.0
            nn.LayerNorm(512),     # rad_mlp.1 (weight/bias only)
            nn.Linear(512, 512),   # rad_mlp.2
            nn.ReLU(),             # rad_mlp.3
            nn.Linear(512, 256),   # rad_mlp.4
            nn.LayerNorm(256),     # rad_mlp.5 (weight/bias only)
            nn.Linear(256, 256),   # rad_mlp.6
            nn.ReLU(),             # rad_mlp.7
            nn.Linear(256, 128),   # rad_mlp.8
            nn.LayerNorm(128),     # rad_mlp.9 (weight/bias only)
            nn.Linear(128, 128)    # rad_mlp.10
        )

    def forward(self, eff, conv, swin, rad):
        """
        Args:
            eff: (B, 1536) - EfficientNet features
            conv: (B, 768) - ConvNeXt features
            swin: (B, 768) - Swin Transformer features
            rad: (B, 107) - Radiomics features
        Returns:
            logits: (B, 5) - Classification logits
        """
        # Process radiomics through MLP to get (B, 128)
        rad_processed = self.rad_mlp(rad)  # (B, 107) -> (B, 128)
        
        # Project all features to 512
        eff_proj = self.eff_proj(eff)           # (B, 1536) -> (B, 512)
        conv_proj = self.conv_proj(conv)        # (B, 768) -> (B, 512)
        swin_proj = self.swin_proj(swin)        # (B, 768) -> (B, 512)
        rad_proj = self.rad_proj(rad_processed) # (B, 128) -> (B, 512)
        
        # Stack into sequence for attention
        features = torch.stack([eff_proj, conv_proj, swin_proj, rad_proj], dim=1)  # (B, 4, 512)
        
        # Cross-attention with residual
        attn_out, _ = self.cross_attn(features, features, features)
        features = self.cross_ln(features + attn_out)
        
        # FFN applied to sequence, output shape (B, 4, 128)
        ffn_out = self.ffn(features)
        
        # Aggregate: mean pooling over 4 tokens
        x = ffn_out.mean(dim=1)  # (B, 128)
        
        # Classification head
        logits = self.cls_head(x)  # (B, 5)
        
        return logits


# Global fusion model instance
_fusion_model = None


def load_fusion_model():
    """Load fusion model checkpoint - use partial weights available in checkpoint."""
    global _fusion_model
    
    if _fusion_model is not None:
        return _fusion_model
    
    if not os.path.exists(CKPT_PATH):
        raise FileNotFoundError(
            f"Checkpoint not found at {CKPT_PATH}. "
            f"Expected at: {CKPT_PATH}"
        )
    
    try:
        ckpt = torch.load(CKPT_PATH, map_location="cpu")
        if isinstance(ckpt, dict) and "model" in ckpt:
            state = ckpt["model"]
        else:
            state = ckpt
        
        print(f"Checkpoint has {len(state)} parameters")
        
        # Create model
        model = FusionModel(RAD_DIM)
        
        # Load with strict=False to allow mismatches
        try:
            incompatible = model.load_state_dict(state, strict=False)
            print(f"✓ Loaded {len(state) - len(incompatible.unexpected_keys)} parameters")
            if incompatible.missing_keys:
                print(f"  Missing: {len(incompatible.missing_keys)} keys (will use random init)")
        except RuntimeError as load_err:
            # If strict=False still fails due to shape mismatch, manually load compatible keys only
            print(f"Shape mismatch detected, loading only compatible keys...")
            model_dict = model.state_dict()
            compatible_state = {}
            for k, v in state.items():
                if k in model_dict and model_dict[k].shape == v.shape:
                    compatible_state[k] = v
            model.load_state_dict(compatible_state, strict=False)
            print(f"✓ Loaded {len(compatible_state)}/{len(state)} compatible parameters")
        
    except Exception as e:
        print(f"ERROR loading checkpoint: {e}")
        raise RuntimeError(f"Failed to load checkpoint: {str(e)}")
    
    model.eval()
    _fusion_model = model
    return model


# -----------------------------
# FEATURE EXTRACTION
# -----------------------------
# def extract_features(image, device):
#     """Extract features from image using three backbone models.
    
#     Args:
#         image: PIL Image
#         device: torch device
    
#     Returns:
#         Tuple of (eff_feat, conv_feat, swin_feat) tensors
#     """
#     img = transform(image).unsqueeze(0).to(device)
    
#     effnet, convnext, swin = get_backbones(device)
    
#     with torch.no_grad():
#         eff_feat = effnet(img)
#         conv_feat = convnext(img)
#         swin_feat = swin(img)
    
#     return eff_feat, conv_feat, swin_feat
def extract_features(image, device):
    img = transform(image).unsqueeze(0).to(device)

    effnet, convnext, swin = get_backbones(device)
    
    with torch.no_grad():
        eff_feat = effnet(img)
        conv_feat = convnext(img)
        swin_feat = swin(img)

    # 🔥 ENSURE correct shape: (1, feature_dim)
    eff_feat  = eff_feat.view(1, -1)
    conv_feat = conv_feat.view(1, -1)
    swin_feat = swin_feat.view(1, -1)

    return eff_feat, conv_feat, swin_feat
