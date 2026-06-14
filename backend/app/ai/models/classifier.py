import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import io
import os

CLASS_NAMES = [
    "Cooling_Fan",
    "Motor_Controller",
    "Brake_Component"
]

class CarComponentClassifier:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self._load_model()
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def _load_model(self):
        model = models.mobilenet_v3_large(weights=None)
        model.classifier[3] = torch.nn.Linear(
            model.classifier[3].in_features,
            len(CLASS_NAMES)
        )
        weights_path = os.path.join(
            os.path.dirname(__file__),
            "../weights/mobilenet_car.pt"
        )
        if os.path.exists(weights_path):
            model.load_state_dict(
                torch.load(weights_path, map_location=self.device)
            )
            print("Classifier weights loaded")
        else:
            print("No weights found - training from scratch")

        model.to(self.device)
        model.eval()
        return model

    def predict(self, image_bytes: bytes) -> tuple[str, float]:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = self.transform(img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(tensor)
            probs = torch.softmax(outputs, dim=1)
            confidence, predicted = torch.max(probs, 1)

        class_name = CLASS_NAMES[predicted.item()]
        conf_score = confidence.item()
        return class_name, conf_score
