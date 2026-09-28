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

logger = logging.getLogger("MetronIQ-OCR")

class OCRHardwareError(Exception):
    """Explicitly tracks local hardware incompatibility or external microservice failure."""
    pass

class PaddleOCRWrapper:
    def __init__(self, lang: str = 'en'):
        self.ocr_service_url = os.getenv("OCR_SERVICE_URL", "").strip().rstrip("/")
        
        # Explicitly disable local fallback to prevent memory leaks/crashes (Exit 137) on Railway.
        self.ocr = None

        if self.ocr_service_url:
            logger.info(f"Using external OCR Microservice at {self.ocr_service_url}. Local fallback is DISABLED.")
        else:
            logger.warning("OCR_SERVICE_URL is not set. External OCR is unavailable and local fallback is DISABLED.")

    def extract_text(self, image: np.ndarray) -> List[Dict[str, Any]]:
        # Route to external microservice if configured
        if self.ocr_service_url:
            try:
                return self._extract_text_remote(image)
            except OCRHardwareError as e:
                logger.error(f"Remote OCR failed: {e}. Local fallback is DISABLED to prevent Railway OOM.")
                raise

        raise OCRHardwareError("OCR_SERVICE_UNAVAILABLE: No external OCR_SERVICE_URL configured and local OCR fallback is disabled.")

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
        
        # Max retries extended to account for Codespace hibernation wake-up which can take 15-30 seconds
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
                        # If GitHub intercepts with HTML "Waking up", it's not valid JSON
                        logger.warning(f"Remote OCR attempt {attempt + 1}: Received non-JSON response (likely Codespace waking up)")
                        if attempt == max_retries:
                            raise OCRHardwareError("OCR_SERVICE_UNAVAILABLE: Invalid JSON response (Codespace waking)")
                        time.sleep(5.0)
                        continue
                else:
                    logger.warning(f"Remote OCR service returned HTTP {response.status_code}: {response.text[:200]}")
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
