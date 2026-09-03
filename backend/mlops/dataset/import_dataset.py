import os
import argparse
import hashlib
import json
import cv2
import uuid
import shutil
from datetime import datetime

SUPPORTED_FORMATS = ('.jpg', '.jpeg', '.png')
MANIFEST_FILE = "dataset_manifest.json"

def calculate_sha256(filepath):
    sha256 = hashlib.sha256()
    try:
        with open(filepath, "rb") as f:
            for block in iter(lambda: f.read(4096), b""):
                sha256.update(block)
        return sha256.hexdigest()
    except Exception:
        return None

def import_images(source_dir, dest_dir="images/train"):
    if not os.path.exists(source_dir):
        print(f"[ERROR] Source directory {source_dir} not found.")
        return

    os.makedirs(dest_dir, exist_ok=True)
    
    manifest_path = os.path.join(os.path.dirname(__file__), MANIFEST_FILE)
    manifest = []
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)

    existing_hashes = {img['sha256'] for img in manifest}
    
    processed_count = 0
    duplicate_count = 0
    corrupt_count = 0

    for root, _, files in os.walk(source_dir):
        for file in files:
            if not file.lower().endswith(SUPPORTED_FORMATS):
                continue
                
            filepath = os.path.join(root, file)
            file_hash = calculate_sha256(filepath)
            
            if not file_hash:
                corrupt_count += 1
                continue
                
            if file_hash in existing_hashes:
                duplicate_count += 1
                continue
                
            # OpenCV Validation / Dim Check
            img = cv2.imread(filepath)
            if img is None:
                print(f"[WARN] Corrupt image detected: {file}")
                corrupt_count += 1
                continue
                
            height, width = img.shape[:2]
            image_id = str(uuid.uuid4())
            new_filename = f"{image_id}.jpg"
            dest_path = os.path.join(os.path.dirname(__file__), dest_dir, new_filename)
            
            shutil.copy2(filepath, dest_path)
            
            record = {
                "image_id": image_id,
                "original_filename": file,
                "sha256": file_hash,
                "width": width,
                "height": height,
                "source": "PENDING_CLASSIFICATION",
                "license": "PENDING_VERIFICATION",
                "obtained_date": datetime.now().isoformat(),
                "category": "UNCATEGORIZED",
                "annotation_status": "PENDING"
            }
            manifest.append(record)
            existing_hashes.add(file_hash)
            processed_count += 1

    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=4)
        
    print("====================================")
    print("METRONIQ DATA IMPORT COMPLETE")
    print(f"Successfully Imported: {processed_count}")
    print(f"Duplicates Skipped: {duplicate_count}")
    print(f"Corrupt/Invalid: {corrupt_count}")
    print("====================================")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import packaged commodity dataset.")
    parser.add_argument("--source", type=str, required=True, help="Path to raw source images.")
    parser.add_argument("--dest", type=str, default="images/train", help="Destination subset (train/val/test).")
    args = parser.parse_args()
    
    import_images(args.source, args.dest)
