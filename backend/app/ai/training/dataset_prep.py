import os
import shutil
import random
from pathlib import Path

SOURCE_DIR = "app/ai/training/raw_images"
OUTPUT_DIR = "app/ai/training/dataset"
SPLIT_RATIO = 0.8

CLASS_NAMES = [
    "Alternator", "Brake Caliper", "Catalytic Converter",
    "Fuel Injector", "Radiator", "Serpentine Belt",
    "Shock Absorber", "Timing Belt", "Turbocharger", "Water Pump"
]

def create_dataset_structure():
    for class_name in CLASS_NAMES:
        os.makedirs(f"{OUTPUT_DIR}/{class_name}", exist_ok=True)
    print(f"✅ Created dataset folders in {OUTPUT_DIR}")

def organize_images():
    if not os.path.exists(SOURCE_DIR):
        print(f"❌ Source directory not found: {SOURCE_DIR}")
        print("Place your raw images in subfolders named after each component")
        return

    for class_name in CLASS_NAMES:
        src = os.path.join(SOURCE_DIR, class_name)
        dst = os.path.join(OUTPUT_DIR, class_name)

        if not os.path.exists(src):
            print(f"⚠️ No images found for: {class_name}")
            continue

        images = [f for f in os.listdir(src)
                  if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]

        for img in images:
            shutil.copy(
                os.path.join(src, img),
                os.path.join(dst, img)
            )

        print(f"✅ {class_name}: {len(images)} images organized")

def create_yolo_yaml():
    yaml_content = f"""
path: {os.path.abspath(OUTPUT_DIR)}
train: .
val: .

nc: {len(CLASS_NAMES)}
names: {CLASS_NAMES}
"""
    with open("app/ai/training/dataset.yaml", "w") as f:
        f.write(yaml_content)
    print("✅ dataset.yaml created for YOLO training")

def print_dataset_stats():
    print("\n📊 Dataset Statistics:")
    total = 0
    for class_name in CLASS_NAMES:
        path = os.path.join(OUTPUT_DIR, class_name)
        if os.path.exists(path):
            count = len([f for f in os.listdir(path)
                        if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
            total += count
            status = "✅" if count >= 50 else "⚠️ (need more images)"
            print(f"  {class_name}: {count} images {status}")
        else:
            print(f"  {class_name}: ❌ folder missing")
    print(f"\nTotal: {total} images")
    print(f"Minimum recommended: {len(CLASS_NAMES) * 50} images")

if __name__ == "__main__":
    create_dataset_structure()
    organize_images()
    create_yolo_yaml()
    print_dataset_stats()