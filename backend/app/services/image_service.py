import cv2
import numpy as np
from config import settings

def validate_image(contents: bytes) -> tuple[bool, str]:
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return False, "Invalid image file"

    h, w = img.shape[:2]
    if w < settings.MIN_IMAGE_WIDTH or h < settings.MIN_IMAGE_HEIGHT:
        return False, f"Image too small. Minimum size is {settings.MIN_IMAGE_WIDTH}x{settings.MIN_IMAGE_HEIGHT}px"

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_score < 50:
        return False, "Image is too blurry. Please retake."

    brightness = gray.mean()
    if brightness < 40:
        return False, "Image is too dark. Please retake in better lighting."

    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.MAX_IMAGE_SIZE_MB:
        return False, f"Image too large. Max size is {settings.MAX_IMAGE_SIZE_MB}MB"

    return True, ""