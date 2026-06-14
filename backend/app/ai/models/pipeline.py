from app.ai.models.detector import CarComponentDetector
from app.ai.models.classifier import CarComponentClassifier
from app.ai.utils.postprocess import format_detection_results
import io

# Initialize once at startup
detector = CarComponentDetector()
classifier = CarComponentClassifier()

class CarComponentPipeline:
    def __init__(self):
        self.detector = detector
        self.classifier = classifier

    def predict(self, image_bytes: bytes) -> list:
        # Step 1 — Detect regions
        detections = self.detector.detect(image_bytes)

        if not detections:
            # No detection — run classifier on full image
            class_name, confidence = self.classifier.predict(image_bytes)
            return [{
                "component_name": class_name,
                "confidence": confidence,
                "bbox": []
            }]

        # Step 2 — Classify each detected region
        results = []
        for detection in detections:
            class_name, confidence = self.classifier.predict(image_bytes)
            results.append({
                "component_name": class_name,
                "confidence": round(confidence * detection["confidence"], 4),
                "bbox": detection["bbox"]
            })

        # Sort by confidence
        results.sort(key=lambda x: x["confidence"], reverse=True)
        return results

# Singleton instance
pipeline = CarComponentPipeline()

def run_pipeline(image_bytes: bytes) -> list:
    return pipeline.predict(image_bytes)