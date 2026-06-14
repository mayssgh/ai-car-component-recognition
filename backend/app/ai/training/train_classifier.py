import torch
import torchvision.transforms as transforms
import torchvision.models as models
from torch.utils.data import DataLoader
from torchvision.datasets import ImageFolder
import os

CLASS_NAMES = [
    "Cooling_Fan",
    "Motor_Controller",
    "Brake_Component"
]

DATASET_PATH = "app/ai/training/dataset"
WEIGHTS_PATH = "app/ai/weights/mobilenet_car.pt"
EPOCHS = 50
BATCH_SIZE = 3
LR = 0.001

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on: {device}")

    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(30),
        transforms.ColorJitter(brightness=0.4, contrast=0.4),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    if not os.path.exists(DATASET_PATH):
        print(f"Dataset not found at {DATASET_PATH}")
        return

    full_dataset = ImageFolder(DATASET_PATH, transform=transform)
    print(f"Found {len(full_dataset)} images in {len(full_dataset.classes)} classes")

    train_loader = DataLoader(full_dataset, batch_size=BATCH_SIZE, shuffle=True)

    model = models.mobilenet_v3_large(weights=None)
    model.classifier[3] = torch.nn.Linear(
        model.classifier[3].in_features, len(CLASS_NAMES)
    )
    model.to(device)

    criterion = torch.nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    best_loss = float("inf")

    for epoch in range(EPOCHS):
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

        acc = 100. * correct / total
        print(f"Epoch {epoch+1}/{EPOCHS} - Loss: {total_loss:.4f} - Acc: {acc:.2f}%")

        if total_loss < best_loss:
            best_loss = total_loss
            os.makedirs(os.path.dirname(WEIGHTS_PATH), exist_ok=True)
            torch.save(model.state_dict(), WEIGHTS_PATH)
            print(f"Model saved!")

    print(f"Training complete! Best loss: {best_loss:.4f}")

if __name__ == "__main__":
    train()
