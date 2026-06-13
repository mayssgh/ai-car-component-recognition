# Scaffold for Khadija to fill
# This wraps the AI pipeline so the scan route stays clean

def run_pipeline(image_bytes: bytes) -> list:
    """
    Takes raw image bytes, runs detection + classification.
    Returns list of:
    [
        {
            "component_name": "Alternator",
            "confidence": 0.92,
            "bbox": [x1, y1, x2, y2]
        }
    ]
    Khadija: import and call your pipeline here
    """
    # TODO: Khadija fills this
    # from app.ai.models.pipeline import CarComponentPipeline
    # pipeline = CarComponentPipeline()
    # return pipeline.predict(image_bytes)

    # Placeholder response until AI is ready
    return [
        {
            "component_name": "Alternator",
            "confidence": 0.91,
            "bbox": [100, 150, 300, 350]
        }
    ]