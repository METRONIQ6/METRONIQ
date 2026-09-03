import logging
import numpy as np
import os
from typing import List, Dict, Any

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

logger = logging.getLogger("MetronIQ-YOLO")

class YoloDetector:
    def __init__(self, target_model: str = "metroniq.pt"):
        self.model_type = "DOMAIN"
        self.target_compliance_classes = [
            "MRP", "NET_QUANTITY", "MANUFACTURER", "CONSUMER_CARE", "IMPORTER", "PACKER"
        ]
        
        if YOLO:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            absolute_path = os.path.join(base_dir, "app", "ai", "models", target_model)
            
            # HARDENING: Check if domain model actually exists!
            if not os.path.exists(absolute_path):
                logger.warning(f"Domain model {absolute_path} NOT FOUND. Falling back to GENERIC YOLO weights.")
                self.model_type = "GENERIC"
                self.model_path = "yolo11n.pt"  # Will trigger ultralytics auto-download of generic weights
            else:
                self.model_path = absolute_path
                
            try:
                self.model = YOLO(self.model_path)
            except Exception as e:
                logger.error(f"Failed to load YOLO model: {str(e)}")
                self.model = None
        else:
            self.model = None

    def scan_package(self, image: np.ndarray, conf=0.25) -> List[Dict[str, Any]]:
        """Returns detected regions. Sets flag if running on generic dev model."""
        if not self.model: 
            raise RuntimeError("DETECTION_FAILED: YOLO Engine missing")
            
        results = self.model.predict(source=image, conf=conf, device='cpu', verbose=False)
        detections = []
        
        for res in results:
            for box in res.boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cls_id = int(box.cls[0])
                raw_class_name = res.names[cls_id]
                
                # STRICT HANDLING: Never pretend generic COCO weights are Legal Declarations
                mapped_name = raw_class_name
                if self.model_type == "GENERIC":
                     mapped_name = f"GENERIC_{raw_class_name.upper()}"
                     
                warnings = []
                if self.model_type == "GENERIC":
                    warnings.append("DOMAIN_MODEL_NOT_CONFIGURED")
                
                detections.append({
                    "class_name": mapped_name,
                    "confidence": round(float(box.conf[0]), 4),
                    "bounding_box": [int(x1), int(y1), int(x2), int(y2)],
                    "engine": "YOLO",
                    "model_type": self.model_type
                })
                
        return detections
