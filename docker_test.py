import subprocess
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

def run_cmd(cmd_list):
    try:
        result = subprocess.run(cmd_list, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')
        if result.stdout:
            return result.stdout.strip()
        return ""
    except subprocess.CalledProcessError as e:
        stdout_str = e.stdout.strip() if e.stdout else ""
        stderr_str = e.stderr.strip() if e.stderr else ""
        return f"[STDERR]\n{stderr_str}\n[STDOUT]\n{stdout_str}"

print("--- VERSIONS ---")
vers_cmd = ["docker", "run", "--rm", "metroniq-ai:latest", "python", "-c", "import sys, cv2, paddle, paddleocr, ultralytics; print(f'PY: {sys.version.split()[0]} | CV2: {cv2.__version__} | PADDLE: {paddle.__version__} | OCR: {paddleocr.__version__} | YOLO: {ultralytics.__version__}')"]
print(run_cmd(vers_cmd))

pwd = os.getcwd()
test_images = [
    "6111242100992_front.jpg",
    "3017620425035_front.jpg", 
    "5449000000996_front.jpg",
    "7613035833272_front.jpg"
]

script = f"""
import sys
import time
import logging
import paddle
logging.getLogger('ppocr').setLevel(logging.ERROR)

def run():
    try:
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        
        images = {test_images}
        for img in images:
            start = time.time()
            res = ocr.ocr(f'/data/openfoodfacts/raw/{{img}}', cls=True)
            print(f'\\n--- IMAGE: {{img}} ---')
            print('OCR STATUS: PASS')
            
            if res and res[0]:
                print(f'REGION COUNT: {{len(res[0])}}')
                for idx, r in enumerate(res[0][:3]):
                    print(f'BOX: {{r[0]}} | TEXT: {{r[1][0]}} | CONF: {{r[1][1]:.3f}}')
                if len(res[0]) > 3:
                    print('... (truncated for brevity)')
            else:
                print('REGION COUNT: 0')
            print(f'TIME: {{time.time() - start:.2f}}s')
            
    except Exception as e:
        print(f"OCR STATUS: FAIL")
        print(f"EXACT ERROR: {{str(e)}}")

run()
"""
os.makedirs("test", exist_ok=True)
with open("test/docker_ocr.py", "w", encoding="utf-8") as f:
    f.write(script)

print("\n--- OCR TESTS ---")
cmd_ocr = ["docker", "run", "--rm", "-v", f"{pwd}\\external_data:/data", "-v", f"{pwd}\\test:/test", "metroniq-ai:latest", "python", "/test/docker_ocr.py"]
print(run_cmd(cmd_ocr))

print("\n--- YOLO TEST ---")
script_yolo = """
import sys
try:
    from ultralytics import YOLO
    model = YOLO('/app/models/yolo/yolo11n.pt')
    results = model('/data/openfoodfacts/raw/6111242100992_front.jpg', verbose=False)
    for r in results:
        boxes = r.boxes
        print(f"MODEL: yolo11n.pt")
        print(f"DETECTION COUNT: {len(boxes)}")
        for i, box in enumerate(boxes):
            cls = int(box.cls[0].item())
            conf = box.conf[0].item()
            cname = model.names[cls]
            b = box.xyxy[0].tolist()
            print(f"CLASS: {cname} | CONF: {conf:.2f}")
except Exception as e:
    print(f"YOLO_EXCEPTION: {str(e)}")
"""
with open("test/docker_yolo.py", "w", encoding="utf-8") as f:
    f.write(script_yolo)

cmd_yolo = ["docker", "run", "--rm", "-v", f"{pwd}\\external_data:/data", "-v", f"{pwd}\\test:/test", "metroniq-ai:latest", "python", "/test/docker_yolo.py"]
print(run_cmd(cmd_yolo))
