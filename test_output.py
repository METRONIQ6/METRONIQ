import os
import sys
import cv2
import json

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.append(backend_dir)

from app.ai.pipeline.scanner_pipeline import ScannerPipeline

def run_output():
    images_dir = os.path.join(backend_dir, "mlops", "dataset", "images", "train")
    if not os.path.exists(images_dir):
        print("Error: images/train not found.")
        return
        
    test_image = None
    for f in os.listdir(images_dir):
        if f.lower().endswith(('.jpg', '.png', '.jpeg')):
            test_image = os.path.join(images_dir, f)
            break
            
    if not test_image:
        print("No test images found.")
        return
        
    print(f"Executing End-to-End MetronIQ Pipeline on: {os.path.basename(test_image)}")
    print("Initializing Pipeline...")
    
    # Needs to be run inside container for PaddleOCR/Ultralytics
    pipeline = ScannerPipeline()
    img = cv2.imread(test_image)
    
    print("\n--- INFERENCE RESULTS ---")
    results = pipeline.run(img, filename=os.path.basename(test_image))
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    run_output()
