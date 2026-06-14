import os
import shutil

SOURCE_DIR = "app/ai/training/raw_images"
OUTPUT_DIR = "app/ai/training/dataset"

CLASS_NAMES = [
    "Cooling_Fan",
    "Motor_Controller",
    "Brake_Component"
]

def create_dataset_structure():
    for class_name in CLASS_NAMES:
        os.makedirs(f"{OUTPUT_DIR}/{class_name}", exist_ok=True)
    print("Created dataset folders")

def organize_images():
    if not os.path.exists(SOURCE_DIR):
        print(f"Source directory not found: {SOURCE_DIR}")
        return
    for class_name in CLASS_NAMES:
        src = os.path.join(SOURCE_DIR, class_name)
        dst = os.path.join(OUTPUT_DIR, class_name)
        if not os.path.exists(src):
            print(f"No images found for: {class_name}")
            continue
        images = [f for f in os.listdir(src)
                  if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
        for img in images:
            shutil.copy(os.path.join(src, img), os.path.join(dst, img))
        print(f"{class_name}: {len(images)} images organized")

def create_yolo_yaml():
    yaml_content = f"path: {os.path.abspath(OUTPUT_DIR)}\ntrain: .\nval: .\nnc: {len(CLASS_NAMES)}\nnames: {CLASS_NAMES}\n"
    with open("app/ai/training/dataset.yaml", "w") as f:
        f.write(yaml_content)
    print("dataset.yaml created")

def print_stats():
    print("\nDataset Statistics:")
    total = 0
    for class_name in CLASS_NAMES:
        path = os.path.join(OUTPUT_DIR, class_name)
        if os.path.exists(path):
            count = len([f for f in os.listdir(path)
                        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
            total += count
            status = "OK" if count >= 1 else "no images found"
            print(f"  {class_name}: {count} images - {status}")
        else:
            print(f"  {class_name}: folder missing")
    print(f"Total: {total} images")

if __name__ == "__main__":
    create_dataset_structure()
    organize_images()
    create_yolo_yaml()
    print_stats()
