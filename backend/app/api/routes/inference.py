import os
import io
import numpy as np
import onnxruntime as ort
from PIL import Image
from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter()

# 1. Establish absolute file paths for system reliability
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) # Points to 'app'
ONNX_MODEL_PATH = os.path.join(BASE_DIR, "ai", "training", "best_model.onnx")
DATASET_PATH = os.path.join(BASE_DIR, "ai", "training", "dataset")

# 2. Safety Check: Verify model exists before starting the session
if not os.path.exists(ONNX_MODEL_PATH):
    raise RuntimeError(f"Critical Error: ONNX model file not found at {ONNX_MODEL_PATH}. Did you run export_to_onnx.py?")

# 3. Load ONNX Session once globally to save memory and CPU cycles
session = ort.InferenceSession(ONNX_MODEL_PATH)

# 4. Dynamically map categories from folder structure (Alphabetical Match to PyTorch)
try:
    CATEGORIES = sorted([d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))])
except Exception:
    # Fallback default if dataset folder is missing during server init
    CATEGORIES = ["Brake_Component", "Cooling_Fan", "Motor_Controller"]

def softmax(x):
    """Computes softmax values to transform raw logits into probabilities."""
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=1, keepdims=True)

@router.post("/predict")
async def predict_component(file: UploadFile = File(...)):
    # Validate file type extension
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image.")

    try:
        # Read file stream safely into memory
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # --- HIGH EFFICIENCY PREPROCESSING PIPELINE ---
        # Step A: Resize to match the ResNet18 input envelope
        img = img.resize((224, 224))
        
        # Step B: Normalize pixels to [0, 1] range
        img_array = np.array(img, dtype=np.float32) / 255.0
        
        # Step C: Apply precise standard ImageNet math channels
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_array = (img_array - mean) / std
        
        # Step D: Transpose shape from (H, W, C) to deep-learning standard (C, H, W)
        img_array = np.transpose(img_array, (2, 0, 1))
        
        # Step E: Add batch dimension -> result shape becomes (1, 3, 224, 224)
        img_array = np.expand_dims(img_array, axis=0)
        
        # CRITICAL FIX: Ensure matrix array matches the ONNX float32 expectations explicitly
        img_array = img_array.astype(np.float32)

        # --- ONNX RUNTIME ENGINE INFERENCE ---
        input_name = session.get_inputs()[0].name
        raw_logits = session.run(None, {input_name: img_array})[0]
        
        # Convert numeric vector array to percentage distributions
        probabilities = softmax(raw_logits)[0]
        predicted_class_idx = int(np.argmax(probabilities))
        
        # Match highest index to our system folders
        component_name = CATEGORIES[predicted_class_idx]
        confidence_score = float(probabilities[predicted_class_idx])
	# --- AUTOMATED BACKGROUND HISTORY LOGGING ---
        LOG_PATH = os.path.join(BASE_DIR, "ai", "training", "inference_history.log")
        from datetime import datetime
        with open(LOG_PATH, "a") as log_file:
            log_file.write(
                f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
                f"Predicted: {component_name} | Confidence: {confidence_score*100:.2f}% | File: {file.filename}\n"
            )
        # Return structured smart response
        return {
            "status": "success",
            "component": component_name,
            "confidence": round(confidence_score, 4),
            "confidence_percentage": f"{round(confidence_score * 100, 2)}%"
        }

    except Exception as e:
        # Gracefully handle unexpected runtime file corruptions
        raise HTTPException(status_code=400, detail=f"Inference engine failure: {str(e)}")