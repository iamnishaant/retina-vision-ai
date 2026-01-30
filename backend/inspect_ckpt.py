import torch

ckpt = torch.load('fusion_best.pth', map_location='cpu')
print("=== CHECKPOINT MODEL KEYS ===")
for k in sorted(ckpt['model'].keys()):
    print(f"{k}: {ckpt['model'][k].shape}")
