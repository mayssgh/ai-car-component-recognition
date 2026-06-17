import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models
from torch.cuda.amp import autocast, GradScaler
import torch.optim as optim

def train_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training running on device: {device}")
    
    # Advanced Data Augmentations for Training
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Clean, simple transforms for Validation (No augmentations, just resizing)
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Load the base dataset
    full_dataset = datasets.ImageFolder('./app/ai/training/dataset')
    
    # Calculate 80% train, 20% validation split lengths
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    
    # Split the dataset deterministically
    torch.manual_seed(42) # Keeps the split identical every time you run it
    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
    
    # Apply their respective transformations
    train_dataset.dataset.transform = train_transform
    val_dataset.dataset.transform = val_transform

    # Optimized Data Loaders
    train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True, num_workers=0, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=4, shuffle=False, num_workers=0, pin_memory=True)

    # Initialize Architecture
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(full_dataset.classes))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-2)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=15)
    scaler = GradScaler()

    best_acc = 0.0

    for epoch in range(15): # Expanded to 15 epochs for better convergence checking
        # --- TRAINING PHASE ---
        model.train()
        running_loss = 0.0
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device, non_blocking=True), labels.to(device, non_blocking=True)
            optimizer.zero_grad(set_to_none=True)

            with autocast():
                outputs = model(inputs)
                loss = criterion(outputs, labels)

            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()

            running_loss += loss.item() * inputs.size(0)
        
        scheduler.step()
        epoch_loss = running_loss / train_size

        # --- VALIDATION PHASE (The Verification Metric) ---
        model.eval()
        val_corrects = 0
        
        with torch.no_grad(): # Disable gradient calculations to save massive CPU/GPU memory
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device, non_blocking=True), labels.to(device, non_blocking=True)
                
                with autocast():
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                
                val_corrects += torch.sum(preds == labels.data)

        epoch_acc = (val_corrects.double() / val_size).item()
        
        print(f"Epoch {epoch+1}/15 | Train Loss: {epoch_loss:.4f} | Val Accuracy: {epoch_acc * 100:.2f}%")

        # Only save weights if validation accuracy improves
        if epoch_acc >= best_acc:
            best_acc = epoch_acc
            os.makedirs('app/ai/training', exist_ok=True)
            torch.save(model.state_dict(), 'app/ai/training/best_model.pth')

    print(f"\nTraining Complete! Best Validation Accuracy achieved: {best_acc * 100:.2f}%")

if __name__ == '__main__':
    train_model()