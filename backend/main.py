# import os
# import uuid
# import zipfile
# import shutil

# from fastapi import FastAPI, UploadFile, File, HTTPException
# from fastapi.responses import FileResponse
# from fastapi.middleware.cors import CORSMiddleware

# import cv2
# import numpy as np

# from .preprocessing import (
#     crop_retina,
#     resize_image,
#     apply_clahe,
#     vessel_mask
# )

# # Fusion service (model inference)
# from .fusion_service import (
#     load_checkpoint,
#     predict_from_embeddings,
#     predict_from_image_bytes,
#     run_test,
# )

# BASE_DIR = os.path.dirname(__file__)
# TEMP_DIR = os.path.join(BASE_DIR, "temp_outputs")
# os.makedirs(TEMP_DIR, exist_ok=True)

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @app.post("/preprocess")
# async def preprocess_image(file: UploadFile = File(...)):
#     uid = uuid.uuid4().hex
#     work_dir = os.path.join(TEMP_DIR, uid)
#     os.makedirs(work_dir, exist_ok=True)

#     # Read image
#     img_bytes = await file.read()
#     img_np = np.frombuffer(img_bytes, np.uint8)
#     original = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
#     if original is None:
#         raise HTTPException(status_code=400, detail="Could not decode image")

#     # 1️⃣ Crop
#     cropped = crop_retina(original)

#     # 2️⃣ Resize
#     resized = resize_image(cropped)

#     # 3️⃣ CLAHE
#     clahe = apply_clahe(resized)

#     # 4️⃣ Vessel Mask
#     vessel = vessel_mask(clahe)

#     # Save outputs (all as JPG)
#     paths = {
#         "original": os.path.join(work_dir, "1_original.jpg"),
#         "cropped": os.path.join(work_dir, "2_cropped.jpg"),
#         "resized": os.path.join(work_dir, "3_resized.jpg"),
#         "clahe": os.path.join(work_dir, "4_clahe.jpg"),
#         "vessel": os.path.join(work_dir, "5_vessel.jpg")
#     }

#     cv2.imwrite(paths["original"], original)
#     cv2.imwrite(paths["cropped"], cropped)
#     cv2.imwrite(paths["resized"], resized)
#     cv2.imwrite(paths["clahe"], clahe)
#     # vessel is single-channel; write as JPG
#     cv2.imwrite(paths["vessel"], vessel)

#     # Zip all images
#     zip_path = os.path.join(TEMP_DIR, f"{uid}.zip")
#     with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zipf:
#         for _, p in paths.items():
#             zipf.write(p, arcname=os.path.basename(p))

#     # Optionally remove the folder with individual images to save space
#     try:
#         shutil.rmtree(work_dir)
#     except Exception:
#         pass

#     return FileResponse(
#         zip_path,
#         media_type="application/zip",
#         filename="preprocessing_results.zip"
#     )


# @app.get("/")
# def read_root():
#     """Basic root endpoint to avoid 404 at GET / and give quick info."""
#     return {
#         "service": "Retina Vision AI - Preprocessing backend",
#         "endpoints": {
#             "preprocess": "POST /preprocess (multipart form, field 'file')",
#             "health": "GET /health"
#         }
#     }


# @app.get("/health")
# def health():
#     return {"status": "ok"}


# # Try to auto-load fusion checkpoint if env var set
# FUSION_CKPT = os.environ.get("FUSION_CKPT")
# if FUSION_CKPT:
#     try:
#         load_checkpoint(FUSION_CKPT)
#     except Exception as e:
#         # log but don't crash the service
#         print("Could not load fusion checkpoint:", e)


# @app.post("/fusion/test")
# async def fusion_test():
#     """Run the evaluation flow using precomputed embeddings and csvs.

#     Requires environment variables or files placed relative to backend:
#     FUSION_EMB_EFF, FUSION_EMB_CONV, FUSION_EMB_SWIN, FUSION_MANIFEST, FUSION_RADIOMICS
#     """
#     emb_eff = os.environ.get("FUSION_EMB_EFF")
#     emb_conv = os.environ.get("FUSION_EMB_CONV")
#     emb_swin = os.environ.get("FUSION_EMB_SWIN")
#     manifest = os.environ.get("FUSION_MANIFEST")
#     radiomics = os.environ.get("FUSION_RADIOMICS")

#     missing = [k for k in (emb_eff, emb_conv, emb_swin, manifest, radiomics) if not k]
#     if missing:
#         raise HTTPException(status_code=400, detail="One or more fusion asset env vars not set")

#     try:
#         res = run_test(emb_eff, emb_conv, emb_swin, manifest, radiomics)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     return res


# @app.post("/fusion/predict_embeddings")
# async def fusion_predict_embeddings(payload: dict):
#     """Predict from precomputed embeddings provided as JSON.

#     JSON shape (single sample): {"eff": [...], "conv": [...], "swin": [...], "rad": [...]}.
#     """
#     try:
#         eff = payload["eff"]
#         conv = payload["conv"]
#         swin = payload["swin"]
#         rad = payload.get("rad")
#     except KeyError:
#         raise HTTPException(status_code=400, detail="Missing required fields: eff, conv, swin")

#     try:
#         out = predict_from_embeddings(eff, conv, swin, rad)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     return out


# @app.post("/fusion/predict_image")
# async def fusion_predict_image(file: UploadFile = File(...), radiomics: Optional[str] = None):
#     """Predict from a single uploaded retinal image. Optional `radiomics` is a JSON list string.
#     Uses a lightweight placeholder image→embedding extractor when pretrained CNN weights are not provided.
#     """
#     contents = await file.read()
#     rad_vec = None
#     if radiomics:
#         try:
#             rad_vec = json.loads(radiomics)
#         except Exception:
#             raise HTTPException(status_code=400, detail="Could not parse radiomics JSON string")

#     try:
#         out = predict_from_image_bytes(contents, radiomics=rad_vec)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     return out
import os
import uuid
import zipfile
import shutil
import json
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
import io

from .preprocessing import (
    crop_retina,
    resize_image,
    apply_clahe,
    vessel_mask
)

# Fusion service (model inference)
from .fusion_service import (
    load_checkpoint,
    predict_from_embeddings,
    predict_from_image_bytes,
    run_test,
)

from .model import (
    load_fusion_model,
    extract_features,
    GRADE_MAP,
    RAD_DIM
)

BASE_DIR = os.path.dirname(__file__)
TEMP_DIR = os.path.join(BASE_DIR, "temp_outputs")
os.makedirs(TEMP_DIR, exist_ok=True)

app = FastAPI(title="Diabetic Retinopathy Grading")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup templates and static files (optional - only if directories exist)
try:
    templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))
except Exception:
    templates = None

try:
    app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
except Exception:
    pass

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model ONCE at startup
fusion_model = None
try:
    fusion_model = load_fusion_model().to(DEVICE)
    fusion_model.eval()
    print("✓ Fusion model loaded successfully")
except Exception as e:
    print(f"ERROR: Could not load fusion model: {e}")
    print(f"Model checkpoint expected at: {os.path.join(BASE_DIR, 'fusion_best.pth')}")
    import traceback
    traceback.print_exc()


@app.post("/preprocess")
async def preprocess_image(file: UploadFile = File(...)):
    uid = uuid.uuid4().hex
    work_dir = os.path.join(TEMP_DIR, uid)
    os.makedirs(work_dir, exist_ok=True)

    # Read image
    img_bytes = await file.read()
    img_np = np.frombuffer(img_bytes, np.uint8)
    original = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
    if original is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    # 1️⃣ Crop
    cropped = crop_retina(original)

    # 2️⃣ Resize
    resized = resize_image(cropped)

    # 3️⃣ CLAHE
    clahe = apply_clahe(resized)

    # 4️⃣ Vessel Mask
    vessel = vessel_mask(clahe)

    # Save outputs (all as JPG)
    paths = {
        "original": os.path.join(work_dir, "1_original.jpg"),
        "cropped": os.path.join(work_dir, "2_cropped.jpg"),
        "resized": os.path.join(work_dir, "3_resized.jpg"),
        "clahe": os.path.join(work_dir, "4_clahe.jpg"),
        "vessel": os.path.join(work_dir, "5_vessel.jpg")
    }

    cv2.imwrite(paths["original"], original)
    cv2.imwrite(paths["cropped"], cropped)
    cv2.imwrite(paths["resized"], resized)
    cv2.imwrite(paths["clahe"], clahe)
    # vessel is single-channel; write as JPG
    cv2.imwrite(paths["vessel"], vessel)

    # Zip all images
    zip_path = os.path.join(TEMP_DIR, f"{uid}.zip")
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zipf:
        for _, p in paths.items():
            zipf.write(p, arcname=os.path.basename(p))

    # Optionally remove the folder with individual images to save space
    try:
        shutil.rmtree(work_dir)
    except Exception:
        pass

    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename="preprocessing_results.zip"
    )


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    """Home endpoint - returns HTML template if available, else simple JSON."""
    if templates:
        try:
            return templates.TemplateResponse(
                "index.html", {"request": request}
            )
        except Exception:
            pass
    
    # Fallback to JSON response
    return {
        "service": "Retina Vision AI - Diabetic Retinopathy Grading",
        "endpoints": {
            "preprocess": "POST /preprocess (multipart form, field 'file')",
            "predict": "POST /predict (multipart form, field 'file')",
            "health": "GET /health"
        }
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Predict diabetic retinopathy grade from a retinal image."""
    if fusion_model is None:
        error_msg = "Fusion model not loaded. Check backend logs during startup."
        print(f"ERROR: {error_msg}")
        raise HTTPException(status_code=503, detail=error_msg)
    
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise ValueError("Uploaded file is empty")
        
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Extract deep features
        eff, conv, swin = extract_features(image, DEVICE)

        # Zero radiomics for demo
        rad = torch.zeros(1, RAD_DIM).to(DEVICE)

        with torch.no_grad():
            logits = fusion_model(eff, conv, swin, rad)
            probs = F.softmax(logits, dim=1)

            pred = torch.argmax(probs, dim=1).item()
            confidence = probs.max().item()

        return {
            "predicted_grade": GRADE_MAP[pred],
            "confidence": round(confidence, 4)
        }
    except Exception as e:
        error_detail = f"{type(e).__name__}: {str(e)}"
        print(f"Prediction error: {error_detail}")
        raise HTTPException(status_code=500, detail=error_detail)


@app.get("/health")
def health():
    return {"status": "ok"}


# Try to auto-load fusion checkpoint if env var set
FUSION_CKPT = os.environ.get("FUSION_CKPT")
if FUSION_CKPT:
    try:
        load_checkpoint(FUSION_CKPT)
    except Exception as e:
        # log but don't crash the service
        print("Could not load fusion checkpoint:", e)


@app.post("/fusion/test")
async def fusion_test():
    """Run the evaluation flow using precomputed embeddings and csvs.

    Requires environment variables or files placed relative to backend:
    FUSION_EMB_EFF, FUSION_EMB_CONV, FUSION_EMB_SWIN, FUSION_MANIFEST, FUSION_RADIOMICS
    """
    emb_eff = os.environ.get("FUSION_EMB_EFF")
    emb_conv = os.environ.get("FUSION_EMB_CONV")
    emb_swin = os.environ.get("FUSION_EMB_SWIN")
    manifest = os.environ.get("FUSION_MANIFEST")
    radiomics = os.environ.get("FUSION_RADIOMICS")

    missing = [k for k in (emb_eff, emb_conv, emb_swin, manifest, radiomics) if not k]
    if missing:
        raise HTTPException(status_code=400, detail="One or more fusion asset env vars not set")

    try:
        res = run_test(emb_eff, emb_conv, emb_swin, manifest, radiomics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return res


@app.post("/fusion/predict_embeddings")
async def fusion_predict_embeddings(payload: dict):
    """Predict from precomputed embeddings provided as JSON.

    JSON shape (single sample): {"eff": [...], "conv": [...], "swin": [...], "rad": [...]}.
    """
    try:
        eff = payload["eff"]
        conv = payload["conv"]
        swin = payload["swin"]
        rad = payload.get("rad")
    except KeyError:
        raise HTTPException(status_code=400, detail="Missing required fields: eff, conv, swin")

    try:
        out = predict_from_embeddings(eff, conv, swin, rad)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return out


@app.post("/fusion/predict_image")
async def fusion_predict_image(file: UploadFile = File(...), radiomics: Optional[str] = None):
    """Predict from a single uploaded retinal image. Optional `radiomics` is a JSON list string.
    Uses a lightweight placeholder image→embedding extractor when pretrained CNN weights are not provided.
    """
    contents = await file.read()
    rad_vec = None
    if radiomics:
        try:
            rad_vec = json.loads(radiomics)
        except Exception:
            raise HTTPException(status_code=400, detail="Could not parse radiomics JSON string")

    try:
        out = predict_from_image_bytes(contents, radiomics=rad_vec)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return out
