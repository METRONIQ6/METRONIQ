import os
import glob
import hashlib
import json
import csv
import cv2
import re
from datetime import datetime
from paddleocr import PaddleOCR
import logging

logging.getLogger('ppocr').setLevel(logging.ERROR)

def calculate_sha256(filepath):
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

WORK_DIR = os.environ.get("WORKSPACE_DIR", ".")
EXTERNAL_DATA = os.path.join(WORK_DIR, "external_data")
MLOPS_DATASET = os.path.join(WORK_DIR, "backend/mlops/dataset")

OCR_RESULTS_DIR = os.path.join(MLOPS_DATASET, "ocr_results")
PROVISIONAL_DIR = os.path.join(MLOPS_DATASET, "provisional")
os.makedirs(OCR_RESULTS_DIR, exist_ok=True)
os.makedirs(PROVISIONAL_DIR, exist_ok=True)

CANDIDATES_CSV = os.path.join(MLOPS_DATASET, "candidate_images.csv")
QUEUE_CSV = os.path.join(MLOPS_DATASET, "human_review_queue.csv")
REPORT_MD = os.path.join(MLOPS_DATASET, "TASK3_SCREENING_REPORT.md")

PATTERNS = {
    "MRP": [r'mrp', r'm\.r\.p', r'maximum retail price', r'max retail price', r'₹', r'rs', r'rs\.', r'inr'],
    "NET_QUANTITY": [r'net qty', r'net quantity', r'net wt', r'net weight', r'net volume', r'net content', r'\b500\s*g\b', r'\b1\s*kg\b', r'\b500\s*ml\b', r'\b1\s*l\b'],
    "MANUFACTURER": [r'manufactured by', r'manufacturer', r'manufactured', r'mfd by', r'mfg by'],
    "PACKER": [r'packed by', r'packer', r'packed', r'packaged by'],
    "IMPORTER": [r'imported by', r'importer(?::)?', r'imported'],
    "CONSUMER_CARE": [r'consumer care', r'customer care', r'customer service', r'helpline', r'contact us', r'call us', r'toll free', r'phone', r'email']
}

def match_text(text):
    text = text.lower()
    matches = []
    for cls, patterns in PATTERNS.items():
        if any(re.search(p, text) for p in patterns):
            matches.append(cls)
    return matches

def main():
    print(f"Scanning directory: {EXTERNAL_DATA}")
    
    extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp")
    image_files = []
    for ext in extensions:
        image_files.extend(glob.glob(os.path.join(EXTERNAL_DATA, "**", ext), recursive=True))

    try:
        ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
    except Exception as e:
        print(f"Failed to initialize PaddleOCR: {e}")
        return

    candidates_rows = []
    queue_rows = []
    
    stats = {
        "total_images": len(image_files),
        "success_ocr": 0,
        "failed_ocr": 0,
        "images_with_candidates": 0,
        "total_regions": 0,
        "mrp": 0,
        "net_quantity": 0,
        "manufacturer": 0,
        "packer": 0,
        "importer": 0,
        "consumer_care": 0,
        "ambiguous": 0,
        "corrupt": 0,
        "duplicate": set()
    }
    
    seen_hashes = set()

    for img_path in image_files:
        if "saved results" in img_path: continue # exclude purely generated debug output
        
        rel_path = os.path.relpath(img_path, WORK_DIR)
        
        try:
            img = cv2.imread(img_path)
            if img is None:
                stats['corrupt'] += 1
                continue
            h, w = img.shape[:2]
        except Exception:
            stats['corrupt'] += 1
            continue
            
        file_hash = calculate_sha256(img_path)
        if file_hash in seen_hashes:
            stats['duplicate'].add(file_hash)
            continue
        seen_hashes.add(file_hash)
        
        try:
            res = ocr.ocr(img)
            ocr_status = "SUCCESS"
            stats['success_ocr'] += 1
        except Exception as e:
            ocr_status = "FAILED"
            stats['failed_ocr'] += 1
            res = None

        has_candidate = False
        img_matched_terms = []
        img_classes = set()
        
        if res and res[0] is not None:
            stats['total_regions'] += len(res[0])
            
            json_regions = []
            
            for idx, region in enumerate(res[0]):
                box = region[0]
                text = region[1][0]
                conf = region[1][1]
                
                json_regions.append({
                    "text": text,
                    "confidence": conf,
                    "bounding_box": box
                })
                
                matched = match_text(text)
                if matched:
                    has_candidate = True
                    img_matched_terms.append(text)
                    for m in matched: 
                        img_classes.add(m)
                    
                    matched_str = matched[0] if len(matched) == 1 else "AMBIGUOUS"
                    
                    if len(matched) > 1:
                        stats['ambiguous'] += 1
                    else:
                        stats[matched[0].lower()] += 1
                    
                    reason = f"Matched internal regex signature" if len(matched) == 1 else f"Multiple regex overlaps: {','.join(matched)}"
                    
                    queue_rows.append({
                        "priority": 1 if conf > 0.9 and len(matched) == 1 else 2,
                        "image_path": rel_path,
                        "candidate_class": matched_str,
                        "ocr_text": text,
                        "ocr_confidence": conf,
                        "provisional_bbox": json.dumps(box),
                        "reason": reason,
                        "review_status": "PENDING"
                    })
                    
                    prov_file = os.path.join(PROVISIONAL_DIR, f"{file_hash}_{idx}.json")
                    with open(prov_file, 'w') as pf:
                        json.dump({
                            "source_image": rel_path,
                            "ocr_text": text,
                            "ocr_confidence": conf,
                            "original_ocr_coordinates": box,
                            "candidate_class": matched_str,
                            "matching_rule": reason
                        }, pf, indent=2)

            ocr_res_file = os.path.join(OCR_RESULTS_DIR, f"{file_hash}.json")
            with open(ocr_res_file, 'w') as of:
                json.dump({
                    "image_path": rel_path,
                    "sha256": file_hash,
                    "ocr_engine": "PaddleOCR",
                    "ocr_version": "2.8.1",
                    "timestamp": datetime.now().isoformat(),
                    "full_ocr_text": " ".join([r["text"] for r in json_regions]),
                    "regions": json_regions
                }, of, indent=2)

        if has_candidate:
            stats["images_with_candidates"] += 1

        candidates_rows.append({
            "image_path": rel_path,
            "sha256": file_hash,
            "source": "external_data",
            "ocr_status": ocr_status,
            "ocr_text": " | ".join(img_matched_terms) if img_matched_terms else "",
            "ocr_confidence": "",
            "matched_terms": " | ".join(img_matched_terms),
            "candidate_classes": ",".join(list(img_classes)),
            "ocr_bbox_count": len(res[0]) if res and res[0] else 0,
            "candidate_reason": "Regex hit" if has_candidate else "",
            "needs_annotation": "TRUE" if has_candidate else "FALSE",
            "annotation_status": "PENDING" if has_candidate else "NONE"
        })

    with open(CANDIDATES_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=candidates_rows[0].keys() if candidates_rows else [])
        if candidates_rows: writer.writeheader()
        writer.writerows(candidates_rows)

    with open(QUEUE_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=queue_rows[0].keys() if queue_rows else [])
        if queue_rows: writer.writeheader()
        queue_rows.sort(key=lambda x: x['priority'])
        writer.writerows(queue_rows)

    with open(REPORT_MD, 'w', encoding='utf-8') as f:
        f.write("# TASK 3 SCREENING REPORT\\n\\n")
        f.write(f"- TOTAL REAL IMAGES: {stats['total_images']}\\n")
        f.write(f"- SUCCESSFUL OCR: {stats['success_ocr']}\\n")
        f.write(f"- FAILED OCR: {stats['failed_ocr']}\\n")
        f.write(f"- IMAGES WITH CANDIDATE TERMS: {stats['images_with_candidates']}\\n")
        f.write(f"- TOTAL OCR REGIONS: {stats['total_regions']}\\n")
        f.write(f"- MRP CANDIDATES: {stats['mrp']}\\n")
        f.write(f"- NET_QUANTITY CANDIDATES: {stats['net_quantity']}\\n")
        f.write(f"- MANUFACTURER CANDIDATES: {stats['manufacturer']}\\n")
        f.write(f"- PACKER CANDIDATES: {stats['packer']}\\n")
        f.write(f"- IMPORTER CANDIDATES: {stats['importer']}\\n")
        f.write(f"- CONSUMER_CARE CANDIDATES: {stats['consumer_care']}\\n")
        f.write(f"- AMBIGUOUS CANDIDATES: {stats['ambiguous']}\\n")
        f.write(f"- DUPLICATE IMAGES: {len(stats['duplicate'])}\\n")
        f.write(f"- CORRUPT IMAGES: {stats['corrupt']}\\n")
        f.write(f"- IMAGES REQUIRING REVIEW: {stats['images_with_candidates']}\\n")

if __name__ == '__main__':
    main()
