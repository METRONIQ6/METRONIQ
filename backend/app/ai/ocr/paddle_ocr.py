import os
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"  # Critical bypass for Paddle v3 C++ Intel translation crash

import logging
import numpy as np
from typing import List, Dict, Any
import traceback

try:
    from paddleocr import PaddleOCR
except ImportError:
    PaddleOCR = None

logger = logging.getLogger("MetronIQ-OCR")

class OCRHardwareError(Exception):
    """Explicitly tracks local hardware incompatibility crashing Paddles CPU threads."""
    pass

class PaddleOCRWrapper:
    def __init__(self, lang: str = 'en'):
        if not PaddleOCR:
            self.ocr = None
            return
            
        try:
            self.ocr = PaddleOCR(use_angle_cls=True, lang=lang, enable_mkldnn=False)
        except Exception as e:
            # Fallback initialization for legacy versions
            self.ocr = PaddleOCR(use_angle_cls=True, lang=lang)

    def extract_text(self, image: np.ndarray) -> List[Dict[str, Any]]:
        if not self.ocr: return []
        
        try:
            result = self.ocr.ocr(image)
            data = []
            if not result or result[0] is None: return data
            
            # PaddleOCR v3.7.0+ returns a dictionary inside the first array element
            if isinstance(result[0], dict):
                r_dict = result[0]
                rec_texts = r_dict.get('rec_texts', [])
                rec_scores = r_dict.get('rec_scores', [])
                dt_polys = r_dict.get('dt_polys', [])
                
                for text, score, box in zip(rec_texts, rec_scores, dt_polys):
                    x_coords, y_coords = [p[0] for p in box], [p[1] for p in box]
                    data.append({
                        "text": text,
                        "confidence": round(float(score), 4),
                        "bounding_box": [int(min(x_coords)), int(min(y_coords)), int(max(x_coords)), int(max(y_coords))]
                    })
                return data
                
            # Legacy PaddleOCR format handling
            for line in result[0]:
                box = line[0]
                x_coords, y_coords = [p[0] for p in box], [p[1] for p in box]
                data.append({
                    "text": line[1][0],
                    "confidence": round(float(line[1][1]), 4),
                    "bounding_box": [int(min(x_coords)), int(min(y_coords)), int(max(x_coords)), int(max(y_coords))]
                })
            return data
            
        except Exception as e:
            error_str = str(e)
            logger.error(f"OCR Framework Error [STRICT EVALUATION]: {error_str}")
            # HARDENING: NEVER silently return fabricated OCR results. Propagate failure cleanly.
            raise OCRHardwareError(f"OCR_FAILED: {error_str}")

