import os
import torch
from torchvision import models
import torch.nn as nn

# 1. Setup dynamic paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # Directory of this script
PTH_PATH = os.path.join(BASE_DIR, "best_model.pth")
ONNX_PATH = os.path.join(BASE_DIR, "best_model.onnx")
DATASET_PATH = os.path.join(BASE_DIR, "dataset")

# 2. Automatically detect number of classes from your dataset folder
num_classes = len([d for d in os.listdir(DATASET_PATH) if os.path.isdir(os.path.join(DATASET_PATH, d))])

# 3. Recreate the model architecture structure
model = models.resnet18()
num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, num_classes)

# 4. Load the trained weights safely using absolute pathing
model.load_state_dict(torch.load(PTH_PATH, map_location='cpu'))
model.eval()

# 5. Create a dummy input matching the 224x224 image dimensions
dummy_input = torch.randn(1, 3, 224, 224)

# 6. Export the model
print(f"Exporting model from {PTH_PATH} to {ONNX_PATH}...")
torch.onnx.export(
    model, 
    dummy_input, 
    ONNX_PATH, 
    export_params=True, 
    opset_version=11, 
    do_constant_folding=True, 
    input_names=['input'], 
    output_names=['output']
)
print("SUCCESS: ONNX export complete.")