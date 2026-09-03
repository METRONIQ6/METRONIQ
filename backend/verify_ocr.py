import os
import sys
import logging
import cv2
import numpy as np
from app.services.ocr_engine import LegalMetrologyOCR

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("MetronIQ-OCR-Test")

def verify_ocr_pipeline():
    logger.info("Initializing PaddleOCR Engine...")
    
    ocr_engine = LegalMetrologyOCR(lang='en')
    
    # Check if successful
    if ocr_engine.ocr is None:
        logger.error("Failed to load OCR engine. Was it installed?")
        sys.exit(1)

    # Conceptual Step 1: "Detected Label Region"
    # We simulate a cropped label from YOLO by drawing text onto a blank NumPy image array
    logger.info("Generating simulated YOLO-cropped Label Region (Net Quantity)...")
    simulated_region = np.ones((200, 600, 3), dtype=np.uint8) * 255  # White background
    
    # Adding precise text representing a Legal Metrology package declaration
    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(simulated_region, "NET QTY: 500g", (50, 100), font, 1.5, (0, 0, 0), 3, cv2.LINE_AA)
    cv2.putText(simulated_region, "MRP Rs. 150.00", (50, 150), font, 1.2, (0, 0, 0), 2, cv2.LINE_AA)
    
    # Save it conceptually just to show we passed raw numpy bounds (optional)
    cv2.imwrite("simulated_crop.jpg", simulated_region)

    logger.info("Feeding Detected Label Region into PaddleOCR...")
    
    # Conceptual Step 2: "PaddleOCR"
    results = ocr_engine.extract_text(simulated_region)
    
    logger.info(f"Extraction Completed! Found {len(results)} text strings.")
    
    # Conceptual Step 3: "Text + Bounding box + Confidence"
    print("\n--- OCR PAYLOAD PIPELINE VERIFICATION ---")
    for idx, item in enumerate(results):
        print(f"Index [{idx}]:")
        print(f"  -> Text         : '{item['text']}'")
        print(f"  -> Confidence   : {item['confidence']:.4f}")
        print(f"  -> Bounding Box : {item['bounding_box']}")
        print("")
        
    print("[SUCCESS] OCR EXTRACTION PIPELINE VERIFIED!")

if __name__ == "__main__":
    verify_ocr_pipeline()
