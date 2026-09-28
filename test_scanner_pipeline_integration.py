import os
import sys

# Point to local OCR microservice running on WSL port 8009
os.environ["OCR_SERVICE_URL"] = "http://localhost:8009"

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

import cv2
import json
from app.ai.pipeline.scanner_pipeline import ScannerPipeline

print("=== STEP 4 & 5 TEST: RUNNING SCANNER PIPELINE WITH EXTERNAL OCR SERVICE ===")
pipeline = ScannerPipeline()

# Verification that local PaddleOCR was NOT initialized in this process
assert pipeline.ocr.ocr is None, "FAILURE: Local PaddleOCR model was initialized when OCR_SERVICE_URL was provided!"
print("VERIFIED: Local PaddleOCR model was NOT initialized inside main process (memory preserved!).")

img_path = os.path.join(os.path.dirname(__file__), "backend", "app", "temp_uploads", "INSP-8B89C307.jpg")
image = cv2.imread(img_path)
assert image is not None, f"Failed to load {img_path}"

# Run end-to-end scanner pipeline
evidence = pipeline.run(image, filename="INSP-8B89C307.jpg")

print("\n--- PIPELINE EXECUTION SUMMARY ---")
meta = evidence.get("metadata", {})
print(f"OCR Status: {meta.get('ocr_status')}")
print(f"OCR Error: {meta.get('ocr_error')}")
print(f"Model: {meta.get('model_name')}")
print(f"Raw OCR Blocks: {len(evidence.get('raw_ocr', []))}")
print(f"YOLO Objects: {len(evidence.get('yolo_objects', []))}")

declarations = evidence.get("legal_declarations", {})
print(f"Extracted Legal Declarations: {len(declarations)}")
for k, v in declarations.items():
    print(f"  [{k}]: {v.get('value')} (conf: {v.get('confidence')})")

assert meta.get("ocr_status") == "SUCCESS", "Pipeline OCR status should be SUCCESS"
assert len(evidence.get("raw_ocr", [])) > 0, "Pipeline should return OCR blocks"
assert "NET_QUANTITY" in declarations, "NET_QUANTITY declaration should be extracted"
assert "MANUFACTURER" in declarations, "MANUFACTURER declaration should be extracted"

print("\n=== STEP 6 TEST: FAILURE SAFETY WHEN EXTERNAL OCR IS UNAVAILABLE ===")
os.environ["OCR_SERVICE_URL"] = "http://localhost:9999"  # Deliberately invalid port
failing_pipeline = ScannerPipeline()

evidence_fail = failing_pipeline.run(image, filename="INSP-8B89C307.jpg")
meta_fail = evidence_fail.get("metadata", {})
print(f"Fail-Safe OCR Status: {meta_fail.get('ocr_status')}")
print(f"Fail-Safe OCR Error: {meta_fail.get('ocr_error')}")

assert meta_fail.get("ocr_status") == "FAILED", "OCR status must be FAILED on dead service"
assert "OCR_SERVICE_UNAVAILABLE" in meta_fail.get("ocr_error"), "Error must report OCR_SERVICE_UNAVAILABLE"
assert evidence_fail is not None, "Scanner pipeline must NOT crash on OCR failure"

print("\nSUCCESS: All pipeline and fail-safe assertions passed!")
