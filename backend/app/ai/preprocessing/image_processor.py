import cv2
import numpy as np

class ImageProcessor:
    def __init__(self, target_size=(1024, 1024)):
        self.target_size = target_size

    def process_pipeline(self, image: np.ndarray) -> np.ndarray:
        img = self.apply_resize(image)
        img = self.apply_noise_reduction(img)
        img = self.apply_contrast_improvement(img)
        return self.apply_rotation_handling(img)

    def apply_resize(self, image: np.ndarray) -> np.ndarray:
        h, w = image.shape[:2]
        max_h, max_w = self.target_size
        scale = min(max_w/w, max_h/h)
        if scale < 1.0:
            return cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        return image

    def apply_noise_reduction(self, image: np.ndarray) -> np.ndarray:
        return cv2.GaussianBlur(image, (3, 3), 0)

    def apply_contrast_improvement(self, image: np.ndarray) -> np.ndarray:
        if len(image.shape) == 3:
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            return cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2BGR)
        return cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(image)

    def apply_rotation_handling(self, image: np.ndarray) -> np.ndarray:
        return image
