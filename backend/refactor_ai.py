import os
import shutil

base_path = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend\app\ai"
old_services_path = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend\app\services"

# Scaffold Directories
directories = ["preprocessing", "detection", "ocr", "extraction", "evidence", "pipeline"]
os.makedirs(base_path, exist_ok=True)
open(os.path.join(base_path, "__init__.py"), "w", encoding="utf-8").close()

for d in directories:
    dir_path = os.path.join(base_path, d)
    os.makedirs(dir_path, exist_ok=True)
    open(os.path.join(dir_path, "__init__.py"), "w", encoding="utf-8").close()

# 2. image_processor.py
with open(os.path.join(base_path, "preprocessing", "image_processor.py"), "w", encoding="utf-8") as f:
    f.write("""import cv2
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
""")

# 3. yolo_detector.py
with open(os.path.join(base_path, "detection", "yolo_detector.py"), "w", encoding="utf-8") as f:
    f.write("""import logging
import numpy as np
from typing import List, Dict, Any

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

logger = logging.getLogger("MetronIQ-YOLO")

class YoloDetector:
    def __init__(self, model_path: str = "yolo11n.pt"):
        self.model_path = model_path
        self.model = YOLO(self.model_path) if YOLO else None

    def scan_package(self, image: np.ndarray, conf=0.25) -> List[Dict[str, Any]]:
        if not self.model: return []
        results = self.model.predict(source=image, conf=conf, device='cpu', verbose=False)
        detections = []
        for res in results:
            for box in res.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cls = int(box.cls[0])
                detections.append({
                    "class_name": res.names[cls],
                    "confidence": round(float(box.conf[0]), 4),
                    "bounding_box": [int(x1), int(y1), int(x2), int(y2)]
                })
        return detections
""")

# 4. paddle_ocr.py
with open(os.path.join(base_path, "ocr", "paddle_ocr.py"), "w", encoding="utf-8") as f:
    f.write("""import logging
import numpy as np
from typing import List, Dict, Any

try:
    from paddleocr import PaddleOCR
except ImportError:
    PaddleOCR = None

logger = logging.getLogger("MetronIQ-OCR")

class PaddleOCRWrapper:
    def __init__(self, lang: str = 'en'):
        self.ocr = PaddleOCR(use_angle_cls=True, lang=lang, show_log=False) if PaddleOCR else None

    def extract_text(self, image: np.ndarray) -> List[Dict[str, Any]]:
        if not self.ocr: return []
        result = self.ocr.ocr(image, cls=True)
        data = []
        if not result or result[0] is None: return data
        for line in result[0]:
            box = line[0]
            x_coords, y_coords = [p[0] for p in box], [p[1] for p in box]
            data.append({
                "text": line[1][0],
                "confidence": round(float(line[1][1]), 4),
                "bounding_box": [int(min(x_coords)), int(min(y_coords)), int(max(x_coords)), int(max(y_coords))]
            })
        return data
""")

# 5. declaration_extractor.py
with open(os.path.join(base_path, "extraction", "declaration_extractor.py"), "w", encoding="utf-8") as f:
    f.write("""import re
from typing import List, Dict, Any

class DeclarationExtractor:
    \"\"\"Extracts specific Legal Metrology vectors from raw OCR text using regex heuristics\"\"\"
    
    def extract(self, ocr_texts: List[Dict[str, Any]]) -> Dict[str, Any]:
        declarations = {}
        for item in ocr_texts:
            text = item['text'].upper()
            
            # Net Quantity matching
            if re.search(r'(NET|QTY|QUANTITY|WEIGHT|\\\\b[MLG]\\\\b)', text):
                declarations['net_quantity'] = item
                
            # MRP / Price matching
            if re.search(r'(MRP|RS|₹|PRICE|INCLUSIVE)', text):
                declarations['mrp'] = item
                
            # Manufacturing Date matching
            if re.search(r'(MFG|PKD|DATE|MFR)', text):
                declarations['mfg_date'] = item

        return declarations
""")

# 6. evidence_generator.py
with open(os.path.join(base_path, "evidence", "evidence_generator.py"), "w", encoding="utf-8") as f:
    f.write("""from typing import Dict, Any, List

class EvidenceGenerator:
    \"\"\"Bundles inferences into the final formatted Matrix for the EvidenceViewer React Component\"\"\"
    
    def generate(self, objects: List[Any], ocr_texts: List[Any], declarations: Dict[str, Any], meta: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "success",
            "metadata": meta,
            "yolo_objects": objects,
            "raw_ocr": ocr_texts,
            "legal_declarations": declarations
        }
""")

# 7. scanner_pipeline.py
with open(os.path.join(base_path, "pipeline", "scanner_pipeline.py"), "w", encoding="utf-8") as f:
    f.write("""import numpy as np
from app.ai.preprocessing.image_processor import ImageProcessor
from app.ai.detection.yolo_detector import YoloDetector
from app.ai.ocr.paddle_ocr import PaddleOCRWrapper
from app.ai.extraction.declaration_extractor import DeclarationExtractor
from app.ai.evidence.evidence_generator import EvidenceGenerator

class ScannerPipeline:
    \"\"\"Master Orchestrator mapping CV modules across the AI boundary\"\"\"
    def __init__(self):
        self.preprocessor = ImageProcessor()
        self.detector = YoloDetector()
        self.ocr = PaddleOCRWrapper()
        self.extractor = DeclarationExtractor()
        self.generator = EvidenceGenerator()

    def run(self, image: np.ndarray, filename: str = "unknown.jpg"):
        # 1. Preprocess
        processed = self.preprocessor.process_pipeline(image)
        
        # 2. Extract bounding objects via YOLO
        objects = self.detector.scan_package(processed)
        
        # 3. Extract text characters via PaddleOCR
        texts = self.ocr.extract_text(processed)
        
        # 4. Legal Metrology validation boundaries
        declarations = self.extractor.extract(texts)
        
        # 5. Generate unified payload
        meta = {"filename": filename, "processed_width": processed.shape[1], "processed_height": processed.shape[0]}
        
        return self.generator.generate(objects, texts, declarations, meta)
""")

# cleanup old services to avoid collision
for old_f in ["image_preprocessor.py", "yolo_scanner.py", "ocr_engine.py"]:
    old_file_path = os.path.join(old_services_path, old_f)
    if os.path.exists(old_file_path):
        os.remove(old_file_path)

print("AI Architecture Modular Refactoring Complete!")
