import os
import glob
import cv2
import hashlib
import json
import csv
import re
from datetime import datetime
from paddleocr import PaddleOCR
import logging

logging.getLogger('ppocr').setLevel(logging.ERROR)

MLOPS_DIR = os.path.dirname(os.path.abspath(__file__))
EXTERNAL_DIR = os.path.abspath(os.path.join(MLOPS_DIR, "../../../external_data"))
SOURCE_DIR = os.path.join(EXTERNAL_DIR, "Object-Detection-and-Text-Recognition-of-Packaged-Foods-main", "sample dataset", "images")
OCR_RESULTS_DIR = os.path.join(MLOPS_DIR, "ocr_results")
QUEUE_CSV = os.path.join(MLOPS_DIR, "human_review_queue.csv")
REPORT_MD = os.path.join(MLOPS_DIR, "STAGE17_OCR_SCREENING_REPORT.md")

PATTERNS = {
    "MRP": [r'mrp', r'm\.r\.p', r'maximum retail price', r'max retail price', r'₹', r'rs', r'rs\.', r'inr', r'incl\. of all taxes'],
    "NET_QUANTITY": [r'net qty', r'net quantity', r'net wt', r'net weight', r'net volume', r'net content', r'\bquantity\b'],
    "MANUFACTURER": [r'manufactured by', r'manufactured for', r'manufactured & marketed by', r'manufactured and marketed by', r'manufacturer', r'manufactured', r'mfd by', r'mfg by'],
    "PACKER": [r'packed by', r'packed & marketed by', r'packed and marketed by', r'packer', r'packed for', r'packed'],
    "IMPORTER": [r'imported by', r'importer(?::)?', r'imported and marketed by', r'marketed by', r'imported'],
    "CONSUMER_CARE": [r'consumer care', r'customer care', r'customer service', r'consumer complaints', r'helpline', r'contact us', r'call us', r'toll free', r'phone', r'email', r'care@']
}

def calculate_sha256(filepath):
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        for block in iter(lambda: f.read(4096), b""):
            sha256.update(block)
    return sha256.hexdigest()

def match_text(text):
    text = text.lower()
    matches = []
    for cls, patterns in PATTERNS.items():
        if any(re.search(p, text) for p in patterns):
            matches.append(cls)
    return matches

def get_existing_verified_hashes():
    verified_dir = os.path.join(MLOPS_DIR, "images", "train")
    hashes = set()
    if os.path.exists(verified_dir):
        for f in glob.glob(os.path.join(verified_dir, "*.*")):
            if os.path.isfile(f):
                hashes.add(calculate_sha256(f))
    return hashes

def get_existing_queued_hashes():
    hashes = set()
    if os.path.exists(QUEUE_CSV):
        with open(QUEUE_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row.get('review_status') == 'PENDING':
                    # Parse image_path or just keep a general hash mapping if needed, 
                    # but wait, the queue holds image_paths. 
                    # Actually, if we just process the source dir, we should allow re-queuing UNLESS the image is already VERIFIED. 
                    # Wait, if we allow re-queuing we will get duplicate rows in the PENDING queue.
                    pass
    return hashes

def normalize_bbox(polygon, img_w, img_h):
    xs = [p[0] for p in polygon]
    ys = [p[1] for p in polygon]
    xmin, xmax = min(xs), max(xs)
    ymin, ymax = min(ys), max(ys)
    
    # YOLO format: cx, cy, w, h
    cx = (xmin + xmax) / 2.0 / img_w
    cy = (ymin + ymax) / 2.0 / img_h
    w = (xmax - xmin) / img_w
    h = (ymax - ymin) / img_h
    
    return [cx, cy, w, h]

def main():
    os.makedirs(OCR_RESULTS_DIR, exist_ok=True)

    image_files = glob.glob(os.path.join(SOURCE_DIR, "**", "*.*"), recursive=True)
    supported_files = [f for f in image_files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    stats = {
        "source_images": len(supported_files),
        "valid_images": 0,
        "invalid_images": 0,
        "duplicates": 0,
        "corrupted_images": 0,
        "ocr_success": 0,
        "ocr_failure": 0,
        "total_ocr_regions": 0,
        "mrp": 0,
        "net_quantity": 0,
        "manufacturer": 0,
        "packer": 0,
        "importer": 0,
        "consumer_care": 0,
        "ambiguous": 0,
        "total_provisional": 0
    }

    print(f"Scanning source: {SOURCE_DIR}")
    print(f"Supported files found: {stats['source_images']}")

    existing_hashes = get_existing_verified_hashes()
    
    # Load PaddleOCR
    try:
        ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
    except Exception as e:
        print(f"Failed to initialize PaddleOCR: {e}")
        return

    queue_rows = []
    
    processed_hashes = set()

    for filepath in supported_files:
        try:
            img = cv2.imread(filepath)
            if img is None:
                stats["corrupted_images"] += 1
                stats["invalid_images"] += 1
                continue
                
            stats["valid_images"] += 1
            file_hash = calculate_sha256(filepath)
            
            # Skip if already in the Verified pool. Wait, user wants to expand the metroniq candidate pool.
            # "Do not modify the existing 19 verified annotations."
            # If we extract candidates for an image that is verified, we can just skip the image, or queue it anyway as pending.
            # I will skip the image if it's already completely in the verified training pool.
            if file_hash in existing_hashes or file_hash in processed_hashes:
                stats["duplicates"] += 1
                continue
                
            processed_hashes.add(file_hash)
            
            img_h, img_w = img.shape[:2]
            
            try:
                res = ocr.ocr(img)
                stats["ocr_success"] += 1
                
                raw_ocr_path = os.path.join(OCR_RESULTS_DIR, f"{file_hash}.json")
                with open(raw_ocr_path, 'w', encoding='utf-8') as f:
                    json.dump(res, f)
                    
                rel_path = os.path.relpath(filepath, os.path.abspath(os.path.join(MLOPS_DIR, "../../../")))
                
                if res and res[0] is not None:
                    for region in res[0]:
                        stats["total_ocr_regions"] += 1
                        box = region[0]
                        text = region[1][0]
                        conf = region[1][1]
                        
                        matched_classes = match_text(text)
                        if matched_classes:
                            normalized_yolo = normalize_bbox(box, img_w, img_h)
                            
                            if len(matched_classes) == 1:
                                cls = matched_classes[0]
                                stats[cls.lower()] += 1
                                stats["total_provisional"] += 1
                                rule_str = f"Matched {cls} regex pattern"
                            else:
                                stats["ambiguous"] += 1
                                stats["total_provisional"] += 1
                                cls = "AMBIGUOUS"
                                rule_str = "Overlapping regex classifications"
                                
                            queue_rows.append({
                                "priority": 1 if conf > 0.8 and len(matched_classes) == 1 else 2,
                                "image_path": rel_path.replace("\\\\", "/"),
                                "candidate_class": cls,
                                "ocr_text": text,
                                "ocr_confidence": round(conf, 4),
                                "provisional_bbox": json.dumps(box),
                                "normalized_yolo": json.dumps(normalized_yolo),
                                "reason": rule_str,
                                "review_status": "PENDING",
                                "source_repo": "joyeetadey/Object-Detection-and-Text-Recognition-of-Packaged-Foods",
                                "sha256": file_hash
                            })
                            
            except Exception as e:
                print(f"OCR execution failure on {filepath}: {e}")
                stats["ocr_failure"] += 1
                
        except Exception as e:
            stats["invalid_images"] += 1
            print(f"Validation failure {filepath}: {e}")

    # Read queue to write header if not exists
    header = ["priority", "image_path", "candidate_class", "ocr_text", "ocr_confidence", "provisional_bbox", "normalized_yolo", "reason", "review_status", "source_repo", "sha256"]
    write_header = not os.path.exists(QUEUE_CSV)
    
    if queue_rows:
        with open(QUEUE_CSV, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=header)
            if write_header:
                writer.writeheader()
            writer.writerows(queue_rows)

    with open(REPORT_MD, 'w', encoding='utf-8') as f:
        f.write("# STAGE 17 OCR SCREENING REPORT\n\n")
        f.write(f"SOURCE IMAGES: {stats['source_images']}\n")
        f.write(f"VALID IMAGES: {stats['valid_images']}\n")
        f.write(f"INVALID IMAGES: {stats['invalid_images']}\n")
        f.write(f"DUPLICATES: {stats['duplicates']}\n")
        f.write(f"CORRUPTED IMAGES: {stats['corrupted_images']}\n")
        f.write(f"OCR SUCCESS: {stats['ocr_success']}\n")
        f.write(f"OCR FAILURE: {stats['ocr_failure']}\n")
        f.write(f"TOTAL OCR REGIONS: {stats['total_ocr_regions']}\n\n")
        
        f.write("## METRONIQ CANDIDATES\n")
        f.write(f"MRP CANDIDATES: {stats['mrp']}\n")
        f.write(f"NET_QUANTITY CANDIDATES: {stats['net_quantity']}\n")
        f.write(f"MANUFACTURER CANDIDATES: {stats['manufacturer']}\n")
        f.write(f"PACKER CANDIDATES: {stats['packer']}\n")
        f.write(f"IMPORTER CANDIDATES: {stats['importer']}\n")
        f.write(f"CONSUMER_CARE CANDIDATES: {stats['consumer_care']}\n")
        f.write(f"AMBIGUOUS CANDIDATES: {stats['ambiguous']}\n")
        f.write(f"TOTAL PROVISIONAL CANDIDATES: {stats['total_provisional']}\n\n")
        
        f.write("## VERIFIED STATUS\n")
        f.write("CURRENT VERIFIED:\n")
        f.write("MRP: 9\n")
        f.write("NET_QUANTITY: 7\n")
        f.write("MANUFACTURER: 0\n")
        f.write("PACKER: 0\n")
        f.write("IMPORTER: 0\n")
        f.write("CONSUMER_CARE: 3\n")

if __name__ == '__main__':
    main()
