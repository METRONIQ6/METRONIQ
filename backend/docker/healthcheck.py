import sys
print(f"Python Version: {sys.version}\n")

components = {
    "OpenCV": lambda: __import__('cv2').__version__,
    "Ultralytics": lambda: __import__('ultralytics').__version__,
    "PaddlePaddle": lambda: __import__('paddle').__version__,
    "PaddleOCR": lambda: __import__('paddleocr').__version__
}

for name, test_func in components.items():
    try:
        ver = test_func()
        print(f"{name}: PASS (v{ver})")
    except Exception as e:
        print(f"{name}: FAIL ({str(e)})")
