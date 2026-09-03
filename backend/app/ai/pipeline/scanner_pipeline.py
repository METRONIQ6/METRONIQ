import numpy as np
import logging
from app.ai.preprocessing.image_processor import ImageProcessor
from app.ai.detection.yolo_detector import YoloDetector
from app.ai.ocr.paddle_ocr import PaddleOCRWrapper
from app.ai.extraction.declaration_extractor import DeclarationExtractor
from app.ai.evidence.evidence_generator import EvidenceGenerator

logger = logging.getLogger("MetronIQ-Pipeline")

class ScannerPipeline:
    """Master Orchestrator mapping CV modules across the AI boundary."""
    def __init__(self):
        self.preprocessor = ImageProcessor()
        self.detector = YoloDetector()
        self.ocr = PaddleOCRWrapper()
        self.extractor = DeclarationExtractor()
        self.generator = EvidenceGenerator()

    def run(self, image: np.ndarray, filename: str = "unknown.jpg"):
        # 1. Preprocess
        processed = self.preprocessor.process_pipeline(image)
        h, w = processed.shape[:2]
        
        # 2. Extract bounding objects via Pre-trained YOLO
        # Target classes: MRP Area, Net Quantity Area, Manufacturer Area, Consumer Care Area
        objects = self.detector.scan_package(processed)
        
        # 3. Read text strictly bounded to detected regions using PaddleOCR
        all_texts = []
        ocr_failed = False
        ocr_error_msg = ""
        
        try:
            from app.ai.ocr.paddle_ocr import OCRHardwareError
            if len(objects) == 0:
                logger.warning("YOLO detection empty: Falling back to holistic OCR parsing.")
                all_texts = self.ocr.extract_text(processed)
            else:
                for obj in objects:
                    x1, y1, x2, y2 = obj['bounding_box']
                    regional_class = obj['class_name']
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(w, x2), min(h, y2)
                    if x2 > x1 and y2 > y1:
                        cropped_region = processed[y1:y2, x1:x2]
                        region_texts = self.ocr.extract_text(cropped_region)
                        for text_item in region_texts:
                            rx1, ry1, rx2, ry2 = text_item['bounding_box']
                            text_item['bounding_box'] = [rx1 + x1, ry1 + y1, rx2 + x1, ry2 + y1]
                            text_item['yolo_region'] = regional_class 
                            all_texts.append(text_item)
        except OCRHardwareError as e:
            logger.error(f"ScannerPipeline caught OCR failure: {str(e)}. Proceeding with YOLO bounds only.")
            ocr_failed = True
            ocr_error_msg = str(e)
                        
        logger.info(f"Target Text Processing Complete. Total vectors derived: {len(all_texts)}")
        
        # 4. Legal Metrology validation boundaries
        declarations = self.extractor.extract(all_texts)
        
        # Determine if it's a valid inspection image based on existing evidence
        is_valid_image = False
        if self.detector.model_type == "DOMAIN" and any(obj.get("class_name") in self.detector.target_compliance_classes for obj in objects):
            is_valid_image = True
        else:
            # Fallback text heuristic to prevent arbitrary logo/images failing all rules
            text_content = " ".join([t.get("text", "").upper() for t in all_texts])
            lm_keywords = ["MRP", "RS", "NET", "WEIGHT", "QUANTITY", "MFG", "PKD", "EXP", "DATE", "BATCH", "INGREDIENT", "MANUFACTURED", "PACKED", "CUSTOMER", "CARE"]
            found_keywords = sum(1 for kw in lm_keywords if kw in text_content)
            if found_keywords >= 1:
                is_valid_image = True

        # 5. Generate unified payload
        meta = {
            "filename": filename, 
            "processed_width": w, 
            "processed_height": h,
            "ocr_status": "FAILED" if ocr_failed else "SUCCESS",
            "ocr_error": ocr_error_msg,
            "model_type": self.detector.model_type,
            "model_name": "metroniq.pt" if self.detector.model_type == "DOMAIN" else "yolo11n.pt",
            "model_version": "1.0.0" if self.detector.model_type == "DOMAIN" else "Ultralytics-Base",
            "is_valid_image": is_valid_image,
            "validation_note": "Valid product evidence found" if is_valid_image else "No valid product/package detected for inspection"
        }
        
        return self.generator.generate(objects, all_texts, declarations, meta)
