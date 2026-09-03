import subprocess
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def run_cmd(cmd_list):
    try:
        result = subprocess.run(cmd_list, check=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8')
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"[ERROR {e.returncode}]\n{e.stdout.strip()}"

def run_in_docker(py_script):
    cmd = ["docker", "run", "--rm", "-v", f"{os.getcwd()}\\external_data:/data", "metroniq-forensic:latest", "python", "-c", py_script]
    return run_cmd(cmd)

print("--- SYSTEM LIBRARIES ---")
print(run_cmd(["docker", "run", "--rm", "metroniq-forensic:latest", "sh", "-c", "ldd --version && uname -a && cat /etc/os-release"]))

print("\n--- CPU INFO ---")
print(run_cmd(["docker", "run", "--rm", "metroniq-forensic:latest", "sh", "-c", "cat /proc/cpuinfo | grep -E 'model name|flags' | head -n 2"]))

print("\n--- DEPENDENCIES METADATA ---")
print(run_cmd(["docker", "run", "--rm", "metroniq-forensic:latest", "sh", "-c", "pip show paddleocr paddlepaddle"]))

print("\n--- PADDLE TENSOR HEALTH ---")
t_script = """
import paddle
try:
    a = paddle.to_tensor([1, 2, 3])
    b = paddle.to_tensor([4, 5, 6])
    print(f"PADDLE TENSOR ADD: {(a+b).numpy()}")
    print("BASIC CPU EXECUTION: PASS")
except Exception as e:
    print(f"BASIC CPU EXECUTION: FAIL -> {str(e)}")
"""
print(run_in_docker(t_script))

print("\n--- REAL OPENCV DECODE & PADDLE OCR TEST 1 ---")
ocr_script = """
import cv2
import paddle
import logging
from paddleocr import PaddleOCR
logging.getLogger('ppocr').setLevel(logging.ERROR)

img_path = '/data/openfoodfacts/raw/6111242100992_front.jpg'
img = cv2.imread(img_path)
print(f"IMAGE 1 DECODE: {'PASS' if img is not None else 'FAIL'} | DIM: {img.shape if img is not None else 'N/A'}")

try:
    ocr = PaddleOCR(lang='en')
    res = ocr.ocr(img_path)
    if res and res[0] is not None:
         print(f"REGION COUNT: {len(res[0])}")
         for i, r in enumerate(res[0]):
             if i < 3: print(f"TEXT: {r[1][0]} | CONF: {r[1][1]:.3f}")
    else:
         print("REGION COUNT: 0")
    print("OCR RUN: PASS")
except Exception as e:
    print(f"OCR RUN: FAIL -> {str(e)}")
"""
print(run_in_docker(ocr_script))

print("\n--- REAL IMAGE 2 TEST ---")
ocr_script2 = """
import logging
logging.getLogger('ppocr').setLevel(logging.ERROR)
try:
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(lang='en')
    res = ocr.ocr('/data/openfoodfacts/raw/3017620425035_front.jpg')
    if res and res[0] is not None:
         print(f"REGION COUNT: {len(res[0])}")
    else:
         print("REGION COUNT: 0")
    print("OCR RUN: PASS")
except Exception as e:
    print(f"OCR RUN: FAIL -> {str(e)}")
"""
print(run_in_docker(ocr_script2))

