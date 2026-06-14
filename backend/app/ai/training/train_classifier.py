import torch
import torchvision.transforms as transforms
import torchvision.models as models
from torch.utils.data import DataLoader
from torchvision.datasets import ImageFolder
import os

CLASS_NAMES = [
    "Alternator", "Brake Caliper", "Catalytic Converter",
    "Fuel Injector", "Radiator", "Serpentine Belt",
    "Shock Absorber", "Timing Belt", "Turbocharger", "Water Pump"
]

DATASET_PATH = "app/ai/training/dataset"
WEIGHTS_PATH = "app/ai/weights/mobilenet_car.pt"
EPOCHS = 20
BATCH_SIZE = 16
LR = 0.001

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on: {device}")

    transform_train = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.3, contrast=0.3),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    transform_val = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    if not os.path.exists(DATASET_PATH):
        print(f"❌ Dataset not found at {DATASET_PATH}")
        print("Create folders: dataset/Alternator/, dataset/Radiator/, etc.")
        return

    full_dataset = ImageFolder(DATASET_PATH, transform=transform_train)
    print(f"✅ Found {len(full_dataset)} images in {len(full_dataset.classes)} classes")
    print(f"Classes: {full_dataset.classes}")

    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(
        full_dataset, [train_size, val_size]
    )

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    model = models.mobilenet_v3_large(pretrained=True)
    model.classifier[3] = torch.nn.Linear(
        model.classifier[3].in_features, len(CLASS_NAMES)
    )
    model.to(device)

    criterion = torch.nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)

    best_acc = 0.0

    for epoch in range(EPOCHS):
        # Training
        model.train()
        total_loss = 0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            _, predicted = outputs.max(1)
            correct += predicted.eq(labels).sum().item()
            total += labels.size(0)

        train_acc = 100. * correct / total

        # Validation
        model.eval()
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = outputs.max(1)
                val_correct += predicted.eq(labels).sum().item()
                val_total += labels.size(0)

        val_acc = 100. * val_correct / val_total
        scheduler.step()

        print(f"Epoch {epoch+1}/{EPOCHS} — "
              f"Loss: {total_loss:.4f} — "
              f"Train Acc: {train_acc:.2f}% — "
              f"Val Acc: {val_acc:.2f}%")

        # Save best model
        if val_acc > best_acc:
            best_acc = val_acc
            os.makedirs(os.path.dirname(WEIGHTS_PATH), exist_ok=True)
            torch.save(model.state_dict(), WEIGHTS_PATH)
            print(f"✅ Best model saved — Val Acc: {val_acc:.2f}%")

    print(f"\n🎉 Training complete! Best accuracy: {best_acc:.2f}%")
    print(f"Model saved to: {WEIGHTS_PATH}")

if __name__ == "__main__":
    train()