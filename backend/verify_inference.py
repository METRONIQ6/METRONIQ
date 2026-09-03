import os
import sys
import logging
from ultralytics import YOLO

# Basic configuring for the test script
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("MetronIQ-YOLO-Test")

def verify_inference():
    logger.info("Initializing Ultralytics YOLO Engine...")
    
    # We will use YOLO11n (Nano) as it is natively supported by the 8.4.134 Ultralytics release we just installed.
    # (yolo26n doesn't officially exist in the public repository yet, so this auto-downloads the real weights).
    model_name = "yolo11n.pt"
    
    logger.info(f"Targeting pretrained model: {model_name}")
    try:
        model = YOLO(model_name)
        logger.info(f"YOLO Model `{model_name}` successfully loaded into memory!")
    except Exception as e:
        logger.error(f"Failed to load / auto-download model: {e}")
        sys.exit(1)

    # Use the official Ultralytics test image
    test_image_url = "https://ultralytics.com/images/bus.jpg"
    logger.info(f"Running test image inference using image: {test_image_url}")
    
    try:
        # Enforce CPU to test our hardware limits properly
        results = model.predict(source=test_image_url, device='cpu', verbose=False)
        
        logger.info(f"Inference Completed! Found {len(results[0].boxes)} objects.")
        
        print("\n--- INFERENCE VERIFICATION BOUNDING BOXES ---")
        for box in results[0].boxes:
            class_id = int(box.cls[0])
            class_name = model.names[class_id]
            confidence = float(box.conf[0])
            coords = [int(i) for i in box.xyxy[0].tolist()]
            print(f"Detected: {class_name:10} | Confidence: {confidence:.2f} | Bounding Box: {coords}")
            
        print("\n[SUCCESS] AI INFERENCE PIPELINE VERIFIED!")
        
    except Exception as e:
        logger.error(f"Inference crashed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    verify_inference()
