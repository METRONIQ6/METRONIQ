try:
    import numpy as np
except ImportError:
    np = None
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
        objects = []
        try:
            objects = self.detector.scan_package(processed)
        except Exception as e:
            logger.warning(f"YOLO detector unavailable or bypassed: {e}")
            objects = []
        
        # 3. Read text strictly bounded to detected regions using PaddleOCR
        all_texts = []
        ocr_failed = False
        ocr_error_msg = ""
        
        try:
            from app.ai.ocr.paddle_ocr import OCRHardwareError
            # RUN OCR ONCE ON FULL IMAGE FOR PERFORMANCE - DO NOT LOOP PER BOX
            all_texts = self.ocr.extract_text(processed)
            
            # Map YOLO zones to OCR blocks to retain spatial intent
            for text_item in all_texts:
                tx1, ty1, tx2, ty2 = text_item['bounding_box']
                t_cx, t_cy = (tx1 + tx2) / 2, (ty1 + ty2) / 2
                
                assigned_region = "GLOBAL_FALLBACK"
                for obj in objects:
                    ox1, oy1, ox2, oy2 = obj['bounding_box']
                    # Check if text center is inside YOLO box
                    if ox1 <= t_cx <= ox2 and oy1 <= t_cy <= oy2:
                        assigned_region = obj['class_name']
                        break
                text_item['yolo_region'] = assigned_region
                
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

# Module-level singleton to prevent duplicate model instantiation
_scanner_pipeline_instance = None

def get_scanner_pipeline() -> ScannerPipeline:
    global _scanner_pipeline_instance
    if _scanner_pipeline_instance is None:
        _scanner_pipeline_instance = ScannerPipeline()
    return _scanner_pipeline_instance
