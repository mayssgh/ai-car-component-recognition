import os
import io
import numpy as np
import onnxruntime as ort
import hashlib
from PIL import Image
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter()
executor = ThreadPoolExecutor(max_workers=4) # Multi-threaded image processing pool

# Cache memory dictionary to store recent prediction hashes
PREDICTION_CACHE = {}

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(CURRENT_DIR)))

ONNX_MODEL_PATH = os.path.join(BACKEND_DIR, "app", "ai", "training", "best_model.onnx")
DATASET_PATH = os.path.join(BACKEND_DIR, "app", "ai", "training", "dataset")
LOG_PATH = os.path.join(BACKEND_DIR, "app", "ai", "training", "inference_history.log")

session = ort.InferenceSession(ONNX_MODEL_PATH)

try:
    CATEGORIES = sorted([d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))])
except Exception:
    CATEGORIES = ["Brake_Component", "Cooling_Fan", "Motor_Controller"]

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=1, keepdims=True)

def process_image_matrix(contents):
    """Heavy matrix math executed safely inside the threadpool worker."""
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img_array = (img_array - mean) / std
    img_array = np.transpose(img_array, (2, 0, 1))
    img_array = np.expand_dims(img_array, axis=0)
    return img_array.astype(np.float32)

@router.post("/predict")
async def predict_component(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image format.")

    try:
        import time
        start_time = time.time() # Start performance metric tracker
        contents = await file.read()
        
        # SMART CACHE CHECK: Hash the file bits to check if we processed this exact image recently
        file_hash = hashlib.md5(contents).hexdigest()
        if file_hash in PREDICTION_CACHE:
            cached_res = PREDICTION_CACHE[file_hash]
            elapsed_time = (time.time() - start_time) * 1000
            print(f"[CACHE HIT] Served prediction instantly in {elapsed_time:.2f}ms")
            return cached_res

        # OFF-LOAD MATH: Send image transformations to the background ThreadPool
        loop = asyncio.get_event_loop()
        img_array = await loop.run_in_executor(executor, process_image_matrix, contents)

        # RUN INFERENCE
        input_name = session.get_inputs()[0].name
        raw_logits = session.run(None, {input_name: img_array})[0]
        
        probabilities = softmax(raw_logits)[0]
        predicted_class_idx = int(np.argmax(probabilities))
        
        component_name = CATEGORIES[predicted_class_idx]
        confidence_score = float(probabilities[predicted_class_idx])
        
        elapsed_time = (time.time() - start_time) * 1000 # Final calculation speed

        # Create structured response payload
        response_data = {
            "status": "success",
            "component": component_name,
            "confidence": round(confidence_score, 4),
            "confidence_percentage": f"{round(confidence_score * 100, 2)}%",
            "server_latency": f"{elapsed_time:.2f}ms" # Show off your speed directly in the JSON response!
        }

        # Store in cache (Limit cache size memory growth)
        if len(PREDICTION_CACHE) > 100:
            PREDICTION_CACHE.clear()
        PREDICTION_CACHE[file_hash] = response_data

        # LOGGING TELEMETRY
        try:
            with open(LOG_PATH, "a") as log_file:
                log_file.write(
                    f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
                    f"Predicted: {component_name.ljust(18)} | "
                    f"Latency: {elapsed_time:.2f}ms | File: {file.filename}\n"
                )
        except Exception:
            pass

        return response_data

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference error: {str(e)}")