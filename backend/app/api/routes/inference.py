import os
import io
import numpy as np
import onnxruntime as ort
from PIL import Image
from datetime import datetime
from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter()

# 1. Establish precise absolute paths for deployment reliability
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__)) # app/api/routes
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR))) # backend/

ONNX_MODEL_PATH = os.path.join(BACKEND_DIR, "app", "ai", "training", "best_model.onnx")
DATASET_PATH = os.path.join(BACKEND_DIR, "app", "ai", "training", "dataset")
LOG_PATH = os.path.join(BACKEND_DIR, "app", "ai", "training", "inference_history.log")

# 2. Safety Check: Verify ONNX engine file exists before boot-up
if not os.path.exists(ONNX_MODEL_PATH):
    raise RuntimeError(f"Critical Error: ONNX model file not found at {ONNX_MODEL_PATH}.")

# 3. Spin up ONNX Runtime session globally once to maximize performance
session = ort.InferenceSession(ONNX_MODEL_PATH)

# 4. Dynamically map categories from local folder structures
try:
    CATEGORIES = sorted([d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))])
except Exception:
    CATEGORIES = ["Brake_Component", "Cooling_Fan", "Motor_Controller"]

def softmax(x):
    """Computes softmax values to transform raw logits into crisp mathematical probabilities."""
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=1, keepdims=True)

@router.post("/predict")
async def predict_component(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image format.")

    try:
        # Read incoming data stream securely into memory
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # --- PREPROCESSING MATRIX PIPELINE ---
        img = img.resize((224, 224))
        img_array = np.array(img, dtype=np.float32) / 255.0
        
        # Standard ImageNet channel normalizations
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_array = (img_array - mean) / std
        
        # Transpose shape parameters to deep learning standards: (H,W,C) -> (C,H,W)
        img_array = np.transpose(img_array, (2, 0, 1))
        img_array = np.expand_dims(img_array, axis=0)
        
        # CRITICAL CONVERSION: Freeze arrays to single-precision float32 tensors
        img_array = img_array.astype(np.float32)

        # --- ONNX INFERENCE ENGINE EXECUTION ---
        input_name = session.get_inputs()[0].name
        raw_logits = session.run(None, {input_name: img_array})[0]
        
        # Extract highest statistical value mapping
        probabilities = softmax(raw_logits)[0]
        predicted_class_idx = int(np.argmax(probabilities))
        
        component_name = CATEGORIES[predicted_class_idx]
        confidence_score = float(probabilities[predicted_class_idx])

        # --- AUTOMATED BACKGROUND HISTORY LOGGING ---
        try:
            with open(LOG_PATH, "a") as log_file:
                log_file.write(
                    f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
                    f"Predicted: {component_name.ljust(18)} | "
                    f"Confidence: {confidence_score*100:.2f}% | "
                    f"File: {file.filename}\n"
                )
        except Exception as log_err:
            print(f"Warning: Telemetry log could not write: {str(log_err)}")

        # Return standardized payload structure
        return {
            "status": "success",
            "component": component_name,
            "confidence": round(confidence_score, 4),
            "confidence_percentage": f"{round(confidence_score * 100, 2)}%"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference engine failure: {str(e)}")