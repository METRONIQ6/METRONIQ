import os
import sys
import gc
import time
import subprocess

# Point to external OCR service
os.environ["OCR_SERVICE_URL"] = "http://localhost:8009"

pid = os.getpid()

def get_mem_mb():
    cmd = f"powershell -NoProfile -Command \"(Get-Process -Id {pid}).WorkingSet64\""
    out = subprocess.check_output(cmd, shell=True).decode().strip()
    return int(out) / (1024 * 1024)

print("=== BENCHMARKING METRONIQ RAILWAY PROCESS MEMORY (EXTERNAL OCR) ===")
mem_start = get_mem_mb()
print(f"Base process memory: {mem_start:.2f} MB")

# 1. Startup & Imports
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))
import cv2
from app.ai.pipeline.scanner_pipeline import get_scanner_pipeline
from app.main import app

mem_startup = get_mem_mb()
print(f"Startup Memory (FastAPI + MetronIQ imports): {mem_startup:.2f} MB")

# 2. Idle Memory
time.sleep(1.0)
gc.collect()
mem_idle = get_mem_mb()
print(f"Idle Memory: {mem_idle:.2f} MB")

# Verify local PaddleOCR is NOT loaded
pipeline = get_scanner_pipeline()
assert pipeline.ocr.ocr is None, "PaddleOCR model must NOT be loaded locally!"
print(f"Local PaddleOCR is NOT loaded: True")

# 3. Scanner Memory (First Request)
img_path = os.path.join(os.path.dirname(__file__), "backend", "app", "temp_uploads", "INSP-8B89C307.jpg")
image = cv2.imread(img_path)

res1 = pipeline.run(image, filename="INSP-8B89C307.jpg")
mem_scanner_first = get_mem_mb()
print(f"Scanner Memory (First Request): {mem_scanner_first:.2f} MB")

# 4. Multiple Sequential Scans & Peak Tracking
peak_mem = mem_scanner_first
for i in range(5):
    res = pipeline.run(image, filename="INSP-8B89C307.jpg")
    curr = get_mem_mb()
    if curr > peak_mem:
        peak_mem = curr
    print(f"Sequential Scan #{i+1} Memory: {curr:.2f} MB")

# 5. Post-Scan / Cooldown
del res
del res1
del image
gc.collect()
time.sleep(1.0)
mem_post_scan = get_mem_mb()

print("\n================ RAILWAY MEMORY PROFILE SUMMARY ================")
print(f"Startup Memory:     {mem_startup:.2f} MB")
print(f"Idle Memory:        {mem_idle:.2f} MB")
print(f"Scanner Memory:     {mem_scanner_first:.2f} MB")
print(f"Peak Memory:        {peak_mem:.2f} MB")
print(f"Post-Scan Memory:   {mem_post_scan:.2f} MB")
print(f"Railway Limit:      1024.00 MB")
print(f"Safety Margin Free: {1024.00 - peak_mem:.2f} MB ({(1024.00 - peak_mem)/1024.00*100:.1f}% free)")
print("================================================================")

assert peak_mem < 512.0, f"Peak memory {peak_mem} MB exceeds target ceiling 512 MB!"
print("PASSED: MetronIQ process is safely and comfortably below 1024 MB Railway memory limit.")
