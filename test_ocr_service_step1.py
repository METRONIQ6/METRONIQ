import os
import sys
import requests
import time
import subprocess
import cv2
import json

print("=== STEP 1 VERIFICATION: OCR SERVICE IMPLEMENTATION ===")

# Verify files exist
required_files = ["main.py", "requirements.txt", "Dockerfile", "README.md"]
for rf in required_files:
    p = os.path.join(os.path.dirname(__file__), "ocr_service", rf)
    assert os.path.exists(p), f"Missing {rf}"
    print(f"File verified: {rf} (size: {os.path.getsize(p)} bytes)")

# Test main.py in WSL environment where PaddleOCR is installed
test_script = """
import sys
import os
sys.path.insert(0, '/mnt/c/Users/balag/.gemini/antigravity/scratch/MetronIQ/ocr_service')
import main

print('PaddleOCR initialized:', main.ocr_engine is not None)
app = main.app
print('FastAPI app loaded:', app.title)
"""

with open("test_wsl_step1.py", "w") as f:
    f.write(test_script)

res = subprocess.run(["wsl", "-d", "Ubuntu", "-e", "/home/balag/.ocr_env/bin/python3", "/mnt/c/Users/balag/.gemini/antigravity/scratch/MetronIQ/test_wsl_step1.py"], capture_output=True, text=True)
print("WSL Execution stdout:\n", res.stdout)
if res.stderr:
    print("WSL Execution stderr:\n", res.stderr)

assert "PaddleOCR initialized: True" in res.stdout
assert "FastAPI app loaded: MetronIQ OCR Microservice" in res.stdout
print("STEP 1 IMPORT AND CONFIGURATION VERIFIED SUCCESSFULLY!")
