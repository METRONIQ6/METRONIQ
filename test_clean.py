import subprocess
import os

def run_in_docker(py_script):
    cmd = ["docker", "run", "--rm", "-v", f"{os.getcwd()}\\external_data:/data", "metroniq-clean:latest", "python", "-c", py_script]
    try:
        result = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8')
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        return f"[ERROR {e.returncode}]\n{e.stdout.strip()}"

print("--- ENV METADATA ---")
print(run_in_docker("""
import sys, paddle, paddleocr, numpy, cv2
with open('/etc/os-release') as f: os_info = [l.strip() for l in f if l.startswith('PRETTY_NAME')][0].split('=')[1].strip('"')
print(f"Python: {sys.version.split(' ')[0]}")
print(f"OS: {os_info}")
print(f"Architecture: x86_64")
print(f"PaddlePaddle: {paddle.__version__}")
print(f"PaddleOCR: {paddleocr.__version__}")
print(f"Paddlex: N/A (PaddleOCR<3.0)")
print(f"NumPy: {numpy.__version__}")
print(f"OpenCV: {cv2.__version__}")
"""))

print("\n--- BASIC PADDLE ---")
print(run_in_docker("""
import paddle
a = paddle.to_tensor([1.0, 2.0])
b = paddle.to_tensor([3.0, 4.0])
res = a + b
print(f"Basic Paddle CPU: PASS" if list(res.numpy()) == [4.0, 6.0] else "Basic Paddle CPU: FAIL")
"""))

print("\n--- REAL IMAGE INFERENCE ---")
print(run_in_docker("""
import cv2
import time
import logging
from paddleocr import PaddleOCR

logging.getLogger('ppocr').setLevel(logging.ERROR)

img_paths = [
    '/data/openfoodfacts/raw/6111242100992_front.jpg',
    '/data/openfoodfacts/raw/3017620425035_front.jpg',
    '/data/openfoodfacts/raw/5449000000996_front.jpg'
]

try:
    ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
    
    for idx, path in enumerate(img_paths):
        print(f"\\nREAL IMAGE {idx+1}:")
        print(f"Filename: {path.split('/')[-1]}")
        img = cv2.imread(path)
        print(f"OpenCV: {'PASS' if img is not None else 'FAIL'}")
        
        try:
            res = ocr.ocr(img)
            print("OCR: PASS")
            if res and res[0] is not None:
                print(f"Regions: {len(res[0])}")
                for i, r in enumerate(res[0]):
                    if i < 3: print(f"Text: {r[1][0]} | Confidence: {r[1][1]:.3f}")
                if len(res[0]) > 3: print("... (truncated)")
            else:
                print("Regions: 0")
        except Exception as ex:
            print(f"OCR: FAIL")
            print(f"Error: {str(ex)}")

except Exception as e:
    print(f"OCR Init FAIL: {str(e)}")
"""))
