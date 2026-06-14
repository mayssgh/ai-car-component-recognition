import cv2
import numpy as np

def check_image_quality(image_bytes: bytes) -> tuple[bool, str]:
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img is None:
        return False, "Invalid image file"

    h, w = img.shape[:2]
    if w < 224 or h < 224:
        return False, "Image too small. Minimum size is 224x224px"

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_score < 50:
        return False, "Image is too blurry. Please retake."

    brightness = gray.mean()
    if brightness < 40:
        return False, "Image is too dark. Please retake in better lighting."
    if brightness > 220:
        return False, "Image is too bright. Please retake."

    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > 10:
        return False, "Image too large. Max size is 10MB"

    return True, ""