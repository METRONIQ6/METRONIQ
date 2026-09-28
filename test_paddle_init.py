import os
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"

import sys
import psutil
import cv2
import json

process = psutil.Process()
mem_startup = process.memory_info().rss / (1024 * 1024)
print(f"[METRIC] Startup Memory: {mem_startup:.2f} MB")

import paddle.inference as paddle_infer
_orig_create_predictor = paddle_infer.create_predictor
def _patched_create_predictor(config):
    try:
        config.delete_pass("self_attention_fuse_pass")
    except Exception:
        pass
    return _orig_create_predictor(config)

paddle_infer.create_predictor = _patched_create_predictor

from paddleocr import PaddleOCR
mem_import = process.memory_info().rss / (1024 * 1024)
print(f"[METRIC] After Import Memory: {mem_import:.2f} MB")

ocr = PaddleOCR(
    text_detection_model_name='PP-OCRv4_mobile_det',
    text_recognition_model_name='PP-OCRv4_mobile_rec',
    use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=False,
    enable_mkldnn=False
)
mem_init = process.memory_info().rss / (1024 * 1024)
print(f"[METRIC] PaddleOCR Initialization Memory: {mem_init:.2f} MB")

def extract_text(image):
    result = ocr.ocr(image)
    data = []
    if not result or result[0] is None: return data
    if isinstance(result[0], dict):
        r_dict = result[0]
        rec_texts = r_dict.get('rec_texts', [])
        rec_scores = r_dict.get('rec_scores', [])
        dt_polys = r_dict.get('dt_polys', [])
        for text, score, box in zip(rec_texts, rec_scores, dt_polys):
            x_coords, y_coords = [p[0] for p in box], [p[1] for p in box]
            data.append({
                "text": text,
                "confidence": round(float(score), 4),
                "bounding_box": [int(min(x_coords)), int(min(y_coords)), int(max(x_coords)), int(max(y_coords))]
            })
        return data
    for line in result[0]:
        box = line[0]
        x_coords, y_coords = [p[0] for p in box], [p[1] for p in box]
        data.append({
            "text": line[1][0],
            "confidence": round(float(line[1][1]), 4),
            "bounding_box": [int(min(x_coords)), int(min(y_coords)), int(max(x_coords)), int(max(y_coords))]
        })
    return data

# Test with real images
img_path1 = "/mnt/c/Users/balag/.gemini/antigravity/scratch/MetronIQ/backend/app/temp_uploads/INSP-8B89C307.jpg"
if not os.path.exists(img_path1):
    img_path1 = "/mnt/c/Users/balag/.gemini/antigravity/scratch/MetronIQ/backend/mlops/dataset/images/train/10.png"

img = cv2.imread(img_path1)
print(f"Loaded test image: {img_path1}, shape={img.shape}")

# First request
res1 = extract_text(img)
mem_first = process.memory_info().rss / (1024 * 1024)
print(f"[METRIC] First OCR Request Memory: {mem_first:.2f} MB (Extracted {len(res1)} text blocks)")
print("Sample extracted text:")
for item in res1[:5]:
    print(f"  - '{item['text']}' (conf: {item['confidence']}, box: {item['bounding_box']})")

# Warm request
res2 = extract_text(img)
mem_warm = process.memory_info().rss / (1024 * 1024)
print(f"[METRIC] Warm OCR Request Memory: {mem_warm:.2f} MB")

# Five sequential requests
peak_mem = mem_warm
for i in range(1, 6):
    res_seq = extract_text(img)
    m = process.memory_info().rss / (1024 * 1024)
    peak_mem = max(peak_mem, m)
    print(f"[METRIC] Sequential Request #{i} Memory: {m:.2f} MB")

print(f"[METRIC] Peak Memory across all runs: {peak_mem:.2f} MB")
