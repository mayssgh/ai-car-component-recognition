from ultralytics import YOLO
import numpy as np
import os

class CarComponentDetector:
    def __init__(self):
        weights_path = os.path.join(
            os.path.dirname(__file__),
            "../weights/yolov8_car.pt"
        )
        if os.path.exists(weights_path):
            self.model = YOLO(weights_path)
            print("✅ YOLO weights loaded")
        else:
            # Use pretrained YOLOv8n as base until custom weights are ready
            self.model = YOLO("yolov8n.pt")
            print("⚠️ No custom YOLO weights — using base YOLOv8n")

    def detect(self, image_bytes: bytes) -> list:
        np_arr = np.frombuffer(image_bytes, np.uint8)
        import cv2
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        results = self.model(img, verbose=False)
        boxes = []

        for result in results:
            for box in result.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = box.conf[0].item()
                boxes.append({
                    "bbox": [x1, y1, x2, y2],
                    "confidence": round(conf, 4)
                })

        return boxes