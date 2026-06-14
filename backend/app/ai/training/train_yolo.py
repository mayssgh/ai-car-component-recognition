from ultralytics import YOLO
import os

DATASET_YAML = "app/ai/training/dataset.yaml"
WEIGHTS_PATH = "app/ai/weights/yolov8_car.pt"
EPOCHS = 50
IMG_SIZE = 640
BATCH_SIZE = 16

def train():
    if not os.path.exists(DATASET_YAML):
        print(f"❌ dataset.yaml not found at {DATASET_YAML}")
        print("Create dataset.yaml with train/val paths and class names")
        return

    model = YOLO("yolov8n.pt")

    results = model.train(
        data=DATASET_YAML,
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        name="bako_car",
        save=True,
        plots=True,
    )

    os.makedirs(os.path.dirname(WEIGHTS_PATH), exist_ok=True)
    best_weights = "runs/detect/bako_car/weights/best.pt"
    if os.path.exists(best_weights):
        import shutil
        shutil.copy(best_weights, WEIGHTS_PATH)
        print(f"✅ Best YOLO weights saved to {WEIGHTS_PATH}")

    print(f"🎉 YOLO Training complete!")

if __name__ == "__main__":
    train()