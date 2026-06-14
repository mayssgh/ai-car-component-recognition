from app.ai.models.pipeline import run_pipeline as _run_pipeline

def run_pipeline(image_bytes: bytes) -> list:
    try:
        return _run_pipeline(image_bytes)
    except Exception as e:
        print(f"AI Pipeline error: {e}")
        # Fallback placeholder until model is trained
        return [{
            "component_name": "Unknown",
            "confidence": 0.0,
            "bbox": []
        }]