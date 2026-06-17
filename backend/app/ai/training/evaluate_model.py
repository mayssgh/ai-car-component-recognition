import os
import torch
import torch.nn as nn
import numpy as np
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix

def run_evaluation():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    PTH_PATH = os.path.join(BASE_DIR, "best_model.pth")
    DATASET_PATH = os.path.join(BASE_DIR, "dataset")
    
    # 1. Loading validation subset data
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    dataset = datasets.ImageFolder(DATASET_PATH, transform=val_transform)
    val_loader = DataLoader(dataset, batch_size=4, shuffle=False)
    
    # 2. Re-initialize model structure 
    model = models.resnet18()
    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, len(dataset.classes))
    model.load_state_dict(torch.load(PTH_PATH, map_location=device))
    model = model.to(device)
    model.eval()
    
    all_preds = []
    all_labels = []
    
    # 3. Extract validation predictions
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            
    # 4. Generate Professional Math Metrics Report
    print("\n================ SYSTEM PERFORMANCE REPORT ================")
    print(classification_report(all_labels, all_preds, target_names=dataset.classes))
    print("===========================================================\n")
    
    # 5. Build and Save the Validation Graph Chart
    cm = confusion_matrix(all_labels, all_preds)
    plt.figure(figsize=(8, 6))
    plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    plt.title('Model Validation Matrix (Precision & Recall Accuracy)')
    plt.colorbar()
    tick_marks = np.arange(len(dataset.classes))
    plt.xticks(tick_marks, dataset.classes, rotation=45)
    plt.yticks(tick_marks, dataset.classes)
    
    plt.ylabel('True Component Label')
    plt.xlabel('Predicted Component Label')
    plt.tight_layout()
    
    # Save chart image to your workspace folder
    chart_path = os.path.join(BASE_DIR, "validation_chart.png")
    plt.savefig(chart_path)
    print(f"[SUCCESS] Validation evaluation graph generated and saved to: {chart_path}")

if __name__ == '__main__':
    run_evaluation()