import os
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"  # Critical bypass for Paddle v3 C++ Intel translation crash
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"

import logging
import numpy as np
from typing import List, Dict, Any
import traceback
import time

try:
    import cv2
except ImportError:
    cv2 = None

try:
    import httpx
except ImportError:
    httpx = None

try:
    from paddleocr import PaddleOCR
except ImportError:
    PaddleOCR = None

logger = logging.getLogger("MetronIQ-OCR")

class OCRHardwareError(Exception):
    """Explicitly tracks local hardware incompatibility or external microservice failure."""
    pass

class PaddleOCRWrapper:
    def __init__(self, lang: str = 'en'):
        self.ocr = None

        logger.info("Self-hosted local environment detected. Initializing local PaddleOCR...")
        if PaddleOCR is not None:
            try:
                self.ocr = PaddleOCR(
                    text_detection_model_name='PP-OCRv4_mobile_det',
                    text_recognition_model_name='PP-OCRv4_mobile_rec',
                    use_doc_orientation_classify=False,
                    use_doc_unwarping=False,
                    use_textline_orientation=False,
                    enable_mkldnn=False
                )
            except Exception as e:
                logger.warning(f"Primary local PaddleOCR initialization failed {e}, trying fallback...")
                try:
                    self.ocr = PaddleOCR(
                        use_doc_orientation_classify=False,
                        use_doc_unwarping=False,
                        use_textline_orientation=False,
                        lang=lang,
                        enable_mkldnn=False
                    )
                except Exception:
                    self.ocr = PaddleOCR(use_angle_cls=False, lang=lang)
        else:
            logger.error("paddleocr library is not installed locally.")

    def extract_text(self, image: np.ndarray) -> List[Dict[str, Any]]:
        if self.ocr:
            return self._extract_text_local(image)

        raise OCRHardwareError("OCR_SERVICE_UNAVAILABLE: Local OCR engine is unavailable.")

    def _extract_text_local(self, image: np.ndarray) -> List[Dict[str, Any]]:
        try:
            result = self.ocr.ocr(image)
            data = []
            if not result or result[0] is None:
                return data

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
            raise OCRHardwareError(f"OCR_FAILED: {error_str}")

    def _extract_text_remote(self, image: np.ndarray) -> List[Dict[str, Any]]:
        if httpx is None:
            raise OCRHardwareError("OCR_FAILED: httpx is required for remote OCR service calls.")

        if cv2 is None:
            raise OCRHardwareError("OCR_FAILED: cv2 is required for image encoding.")

        success, encoded_img = cv2.imencode(".jpg", image)
        if not success:
            raise OCRHardwareError("OCR_FAILED: Failed to encode image for OCR transmission.")
        img_bytes = encoded_img.tobytes()

        url = f"{self.ocr_service_url}/ocr/extract"
        
        max_retries = 3
        timeout = httpx.Timeout(connect=15.0, read=45.0, write=15.0, pool=5.0)

        for attempt in range(max_retries + 1):
            try:
                with httpx.Client(timeout=timeout, verify=False) as client:
                    response = client.post(
                        url,
                        files={"file": ("package.jpg", img_bytes, "image/jpeg")}
                    )
                    
                if response.status_code == 200:
                    try:
                        data = response.json()
                        return data.get("results", [])
                    except Exception:
                        logger.warning(f"Remote OCR attempt {attempt + 1}: Received non-JSON response")
                        if attempt == max_retries:
                            raise OCRHardwareError("OCR_SERVICE_UNAVAILABLE: Invalid JSON response")
                        time.sleep(5.0)
                        continue
                else:
                    logger.warning(f"Remote OCR service returned HTTP {response.status_code}")
                    if attempt == max_retries:
                        raise OCRHardwareError(f"OCR_SERVICE_UNAVAILABLE: HTTP {response.status_code}")
                    time.sleep(3.0)
                    
            except (httpx.RequestError, httpx.TimeoutException) as exc:
                logger.warning(f"Remote OCR attempt {attempt + 1}/{max_retries + 1} failed: {exc}")
                if attempt == max_retries:
                    raise OCRHardwareError(f"OCR_SERVICE_UNAVAILABLE: Connection failed: {exc}")
                time.sleep(4.0)
            except OCRHardwareError:
                raise
            except Exception as e:
                logger.error(f"Unexpected error calling OCR service: {e}")
                raise OCRHardwareError(f"OCR_SERVICE_UNAVAILABLE: {e}")

        return []
