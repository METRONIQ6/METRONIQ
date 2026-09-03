import os
import glob
import csv
import json
import traceback

RAW_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../external_data/openfoodfacts/raw"))
REPORT_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../OPENFOODFACTS_DATASET_REPORT.md"))
QUEUE_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../HUMAN_REVIEW_QUEUE.csv"))

KEYWORDS = {
    "MRP": ["mrp", "m.r.p", "rs.", "₹", "inclusive of all taxes"],
    "NET_QUANTITY": ["net quantity", "net qty", "weight", "net wt", "kg", " g", "ml", " L "],
    "MANUFACTURER": ["manufactured by", "mfg by", "marketed by"],
    "PACKER": ["packed by", "packer"],
    "IMPORTER": ["imported by", "importer"],
    "CONSUMER_CARE": ["consumer care", "customer care", "feedback", "helpline", "email:"]
}

try:
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
except Exception as e:
    ocr = None
    print(f"Failed to load OCR: {e}")

def run_filter():
    images = glob.glob(os.path.join(RAW_DIR, "*.jpg"))
    print(f"Starting OCR Filter on {len(images)} raw images...")
    
    csv_rows = []
    
    total_imgs = len(images)
    ocr_fails = 0
    corrupt = 0
    candidate_count = 0
    
    class_counts = {k: 0 for k in KEYWORDS.keys()}
    
    for img_path in images:
        if not ocr:
            ocr_fails += 1
            break
            
        try:
            # We catch OS-Threading bugs dynamically if Paddle crashes mid-scan
            result = ocr.ocr(img_path, cls=True)
            if not result or not result[0]:
                continue
                
            has_candidate = False
            for line in result[0]:
                text = str(line[1][0]).lower()
                conf = line[1][1]
                bbox = line[0] # [[x,y], [x,y]...]
                
                for cls_name, keywords in KEYWORDS.items():
                    if any(kw in text for kw in keywords):
                        has_candidate = True
                        class_counts[cls_name] += 1
                        
                        csv_rows.append({
                            "image_id": os.path.basename(img_path),
                            "source": "OPENFOODFACTS",
                            "text": text,
                            "ocr_confidence": conf,
                            "candidate_class": cls_name,
                            "status": "PROVISIONAL"
                        })
            
            if has_candidate:
                candidate_count += 1
                
        except Exception as e:
            # Likely the ConvertPirAttribute2RuntimeAttribute OS crash on 3.13 Windows
            print(f"OCR Execution Error on {img_path}")
            ocr_fails += 1
            
    with open(QUEUE_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["image_id", "source", "text", "ocr_confidence", "candidate_class", "status"])
        writer.writeheader()
        writer.writerows(csv_rows)
        
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write("# OPENFOODFACTS DATASET REPORT\n\n")
        f.write(f"- Total Raw Images: {total_imgs}\n")
        f.write(f"- Corrupt Images: {corrupt}\n")
        f.write(f"- Native OCR Fails/Traps: {ocr_fails}\n")
        f.write(f"- Images mapped to Human Review Queue: {candidate_count}\n\n")
        f.write("## Candidate Bounding Classes Identified (Provisional)\n")
        for k, v in class_counts.items():
            f.write(f"- {k}: {v}\n")
        f.write("\n_Note: These are PROVISIONAL boundaries requiring human visual acceptance before metroniq.pt training can proceed._")
        
if __name__ == "__main__":
    run_filter()
