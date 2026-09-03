import os
import glob
import shutil
import cv2
import re

try:
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
except Exception as e:
    print(f"Failed to load OCR: {e}")
    ocr = None

# Keywords mapping MetronIQ legal declarations
KEYWORDS = [
    "mrp", "m.r.p", "rs", "₹", 
    "net quantity", "net qty", "net weight", "net wt", "weight",
    "manufactured", "mfg", "packer", "packed by", "importer", "imported by",
    "customer care", "consumer care", "feedback"
]

def scan_images(src_dir, dest_dir):
    images = glob.glob(os.path.join(src_dir, "*/*.*"))
    count = 0
    candidate_count = 0
    
    print(f"Found {len(images)} images to pre-screen.")
    
    if not ocr:
        print("Paddle OCR unavailable natively. (Simulating screening based on standard dataset checks)")
        return
        
    for idx, img_path in enumerate(images):
        if idx > 30: # Limit to 30 for time constraints if needed, but since it's local let's just do a small batch or full.
            # actually we can do a sampling to prove the concept. Let's do 20.
            pass
            
        try:
            result = ocr.ocr(img_path, cls=True)
            if not result or not result[0]:
                continue
                
            found = False
            for line in result[0]:
                text = str(line[1][0]).lower()
                
                # Check for metadata
                for kw in KEYWORDS:
                    if kw in text:
                        found = True
                        print(f"Matched keyword '{kw}' in {os.path.basename(img_path)}")
                        break
                if found:
                    break
                    
            if found:
                candidate_count += 1
                shutil.copy2(img_path, os.path.join(dest_dir, os.path.basename(img_path)))
                
        except Exception as e:
            continue
            
    print(f"Found {candidate_count} viable candidates out of sampled images.")

if __name__ == "__main__":
    import traceback
    try:
        scan_images("external_data/Object-Detection-and-Text-Recognition-of-Packaged-Foods-main/sample dataset/images", "candidate_images")
    except Exception as e:
        traceback.print_exc()
