import os
import sys
import cv2
import urllib.request
import numpy as np
import json

# Bind backend path explicitly for direct script execution
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.ai.pipeline.scanner_pipeline import ScannerPipeline

def execute_literal_flow():
    print("====================================================")
    print(" METRONIQ AI FLOW LITERAL EXECUTION:")
    print(" Image -> YOLO -> Detection -> PaddleOCR -> Text")
    print("====================================================\n")
    
    print("[1] -> Image (Fetching structural test frame...)")
    # We use Ultralytics' standard test image since it natively has objects (YOLO) and signs/text (OCR).
    url = "https://ultralytics.com/images/bus.jpg"
    req = urllib.request.urlopen(url)
    arr = np.asarray(bytearray(req.read()), dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    print("[2] -> YOLO (Initializing master bounds...)")
    pipeline = ScannerPipeline()
    
    print("[3] -> Detection -> PaddleOCR -> Text (Executing isolated matrix...)")
    evidence_payload = pipeline.run(img, filename="test_bus.jpg")
    
    print("\n[SUCCESS] AI ENGINE OUTPUT PAYLOAD:")
    # Pretty-print the exact mathematical results!
    
    print(f"\nMetadata: {evidence_payload['metadata']}")
    print(f"\n[YOLO BOUNDING BOXES DETECTED]: {len(evidence_payload['yolo_objects'])}")
    for obj in evidence_payload['yolo_objects']:
         print(f" -> {obj['class_name'].upper()} | Conf: {obj['confidence']} | Box: {obj['bounding_box']}")
         
    print(f"\n[PADDLEOCR TEXT STRINGS READ INSIDE THOSE BOUNDS]: {len(evidence_payload['raw_ocr'])}")
    for txt in evidence_payload['raw_ocr']:
         # Print bounding text and mapping context!
         regional_tag = txt.get('yolo_region', 'Fallback_Global')
         print(f" -> '{txt['text']}' | Target Region: [{regional_tag.upper()}] | Conf: {txt['confidence']}")

    print("\n====================================================")

if __name__ == "__main__":
    execute_literal_flow()
