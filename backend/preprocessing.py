import cv2
import numpy as np
from skimage.filters import frangi
from typing import Tuple

IMG_SIZE = (384, 384)
CLAHE_CLIP = 2.0
CLAHE_GRID = (8, 8)


def crop_retina(img: np.ndarray, tol: int = 10) -> np.ndarray:
    """Crop the image to the bounding box of non-background pixels."""
    if img is None:
        raise ValueError("Input image is None")
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mask = gray > tol
    if not mask.any():
        return img
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    return img[rmin:rmax + 1, cmin:cmax + 1]


def resize_image(img: np.ndarray) -> np.ndarray:
    return cv2.resize(img, IMG_SIZE, interpolation=cv2.INTER_AREA)


def apply_clahe(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)

    merged = cv2.merge((cl, a, b))
    enhanced = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)

    # 🔥 Blend with original for natural look
    return cv2.addWeighted(img, 0.5, enhanced, 0.5, 0)



def vessel_mask(img: np.ndarray) -> np.ndarray:
    # Use green channel for vesselness
    green = img[:, :, 1].astype(np.float32) / 255.0
    vesselness = frangi(green)
    if vesselness.max() != 0:
        vesselness = vesselness / vesselness.max()
    out = (vesselness * 255).astype(np.uint8)
    return out
