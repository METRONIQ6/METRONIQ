import os
import glob
import cv2
import hashlib
import json
import csv
import shutil
import re
from datetime import datetime
from paddleocr import PaddleOCR
import logging

logging.getLogger('ppocr').setLevel(logging.ERROR)

MLOPS_DIR = os.path.dirname(os.path.abspath(__file__))
INBOX_DIR = os.path.abspath(os.path.join(MLOPS_DIR, "../../../external_data/metroniq_local/inbox"))
VALIDATED_DIR = os.path.abspath(os.path.join(MLOPS_DIR, "../../../external_data/metroniq_local/validated"))

PROVENANCE_CSV = os.path.join(MLOPS_DIR, "provenance_manifest.csv")
QUEUE_CSV = os.path.join(MLOPS_DIR, "human_review_queue.csv")
CANDIDATES_CSV = os.path.join(MLOPS_DIR, "candidate_images.csv")
REPORT_MD = os.path.join(MLOPS_DIR, "LOCAL_IMPORT_REPORT.md")

PATTERNS = {
    "MRP": [r'mrp', r'm\.r\.p', r'maximum retail price', r'max retail price', r'₹', r'rs', r'rs\.', r'inr', r'incl\. of all taxes'],
    "NET_QUANTITY": [r'net qty', r'net quantity', r'net wt', r'net weight', r'net volume', r'net content', r'\bquantity\b'],
    "MANUFACTURER": [r'manufactured by', r'manufactured for', r'manufactured & marketed by', r'manufactured and marketed by', r'manufacturer', r'manufactured', r'mfd by', r'mfg by'],
    "PACKER": [r'packed by', r'packed & marketed by', r'packed and marketed by', r'packer', r'packed for', r'packed'],
    "IMPORTER": [r'imported by', r'importer(?::)?', r'imported and marketed by', r'marketed by', r'imported'],
    "CONSUMER_CARE": [r'consumer care', r'customer care', r'customer service', r'helpline', r'contact us', r'call us', r'toll free', r'phone', r'email', r'care@']
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

def get_existing_hashes():
    # Scan verified images to track duplicates
    verified_dir = os.path.join(MLOPS_DIR, "images", "train")
    hashes = set()
    if os.path.exists(verified_dir):
        for f in glob.glob(os.path.join(verified_dir, "*.*")):
            if os.path.isfile(f):
                hashes.add(calculate_sha256(f))
    return hashes

def main():
    os.makedirs(INBOX_DIR, exist_ok=True)
    os.makedirs(VALIDATED_DIR, exist_ok=True)

    inbox_files = glob.glob(os.path.join(INBOX_DIR, "*.*"))
    supported_files = [f for f in inbox_files if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    stats = {
        "files_found": len(supported_files),
        "valid_images": 0,
        "corrupted_images": 0,
        "duplicates": 0,
        "new_validated": 0,
        "ocr_success": 0,
        "ocr_failure": 0,
        "mrp": 0,
        "net_quantity": 0,
        "manufacturer": 0,
        "packer": 0,
        "importer": 0,
        "consumer_care": 0
    }

    print(f"Scanning inbox: {INBOX_DIR}")
    print(f"Supported files found: {stats['files_found']}")

    if stats["files_found"] == 0:
        write_report(stats)
        return

    existing_hashes = get_existing_hashes()
    valid_paths_for_ocr = []

    # 1. Verification Phase
    for filepath in supported_files:
        try:
            img = cv2.imread(filepath)
            if img is None:
                stats["corrupted_images"] += 1
                continue
                
            stats["valid_images"] += 1
            file_hash = calculate_sha256(filepath)
            
            if file_hash in existing_hashes:
                stats["duplicates"] += 1
                continue
                
            existing_hashes.add(file_hash)
            stats["new_validated"] += 1
            
            internal_id = f"LOCAL_{file_hash}_{datetime.now().strftime('%Y%m%d%H%M%S')}{os.path.splitext(filepath)[1]}"
            validated_path = os.path.join(VALIDATED_DIR, internal_id)
            shutil.move(filepath, validated_path)
            valid_paths_for_ocr.append((validated_path, file_hash))
            
            # Record Provenance
            with open(PROVENANCE_CSV, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    f"LOCAL_{file_hash[:8]}", "User Local Import", "local", "User", "LOCAL_PRIVATE", "NONE",
                    datetime.now().strftime("%Y-%m-%d"), 1, 0, "NONE", "NONE", "Unknown", "TRUE", "FALSE", "FALSE",
                    "UNKNOWN", "User-provided local real image"
                ])
                
        except Exception as e:
            print(f"Error processing {filepath}: {e}")
            stats["corrupted_images"] += 1

    # 2. OCR Candidate Search
    if valid_paths_for_ocr:
        try:
            ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        except Exception:
            print("Failed to initialize PaddleOCR.")
            write_report(stats)
            return

        queue_rows = []
        candidates_rows = []
        
        for v_path, f_hash in valid_paths_for_ocr:
            try:
                img = cv2.imread(v_path)
                res = ocr.ocr(img)
                stats["ocr_success"] += 1
                
                rel_path = os.path.relpath(v_path, os.path.abspath(os.path.join(MLOPS_DIR, "../../../")))
                img_matched_terms = []
                img_classes = set()
                has_candidate = False
                
                if res and res[0] is not None:
                    for idx, region in enumerate(res[0]):
                        box = region[0]
                        text = region[1][0]
                        conf = region[1][1]
                        
                        matched = match_text(text)
                        if matched:
                            has_candidate = True
                            img_matched_terms.append(text)
                            for m in matched: 
                                img_classes.add(m)
                                
                            matched_str = matched[0] if len(matched) == 1 else "AMBIGUOUS"
                            if len(matched) == 1:
                                stats[matched[0].lower()] += 1
                                
                            queue_rows.append({
                                "priority": 1 if conf > 0.9 and len(matched) == 1 else 2,
                                "image_path": rel_path.replace("\\\\", "/"),
                                "candidate_class": matched_str,
                                "ocr_text": text,
                                "ocr_confidence": conf,
                                "provisional_bbox": json.dumps(box),
                                "reason": f"Matched local regex signature" if len(matched) == 1 else f"Multiple regex overlaps",
                                "review_status": "PENDING"
                            })

                if has_candidate:
                    candidates_rows.append({
                        "image_path": rel_path.replace("\\\\", "/"),
                        "sha256": f_hash,
                        "source": "local_import",
                        "ocr_status": "SUCCESS",
                        "ocr_text": " | ".join(img_matched_terms),
                        "ocr_confidence": "",
                        "matched_terms": " | ".join(img_matched_terms),
                        "candidate_classes": ",".join(list(img_classes)),
                        "ocr_bbox_count": len(res[0]) if res and res[0] else 0,
                        "candidate_reason": "Regex hit",
                        "needs_annotation": "TRUE",
                        "annotation_status": "PENDING"
                    })
                    
            except Exception as e:
                print(f"OCR Error on {v_path}: {e}")
                stats["ocr_failure"] += 1
                
        # Append queues safely without wiping preceding ones
        if queue_rows:
            with open(QUEUE_CSV, 'a', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=queue_rows[0].keys())
                writer.writerows(queue_rows)
        if candidates_rows:
            with open(CANDIDATES_CSV, 'a', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=candidates_rows[0].keys())
                writer.writerows(candidates_rows)

    write_report(stats)

def write_report(stats):
    print("Writing report.")
    with open(REPORT_MD, 'w', encoding='utf-8') as f:
        f.write("# LOCAL IMPORT REPORT\n\n")
        f.write(f"FILES FOUND: {stats['files_found']}\n")
        f.write(f"VALID IMAGES: {stats['valid_images']}\n")
        f.write(f"CORRUPTED IMAGES: {stats['corrupted_images']}\n")
        f.write(f"DUPLICATES: {stats['duplicates']}\n")
        f.write(f"NEW VALIDATED IMAGES: {stats['new_validated']}\n")
        f.write(f"OCR SUCCESS: {stats['ocr_success']}\n")
        f.write(f"OCR FAILURE: {stats['ocr_failure']}\n\n")
        f.write(f"MRP CANDIDATES: {stats['mrp']}\n")
        f.write(f"NET_QUANTITY CANDIDATES: {stats['net_quantity']}\n")
        f.write(f"MANUFACTURER CANDIDATES: {stats['manufacturer']}\n")
        f.write(f"PACKER CANDIDATES: {stats['packer']}\n")
        f.write(f"IMPORTER CANDIDATES: {stats['importer']}\n")
        f.write(f"CONSUMER_CARE CANDIDATES: {stats['consumer_care']}\n\n")
        f.write("EXISTING VERIFIED ANNOTATIONS: 19\n")
        f.write("NEW VERIFIED ANNOTATIONS: 0\n\n")
        f.write("MOCK DATA: 0\n\n")
        f.write("TRAINING STATUS: BLOCKED\n")

if __name__ == '__main__':
    main()
