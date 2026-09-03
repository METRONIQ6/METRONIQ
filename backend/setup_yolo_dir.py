import os
import shutil

backend_path = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend"
yolo_dir = os.path.join(backend_path, "models", "yolo")
detector_file = os.path.join(backend_path, "app", "ai", "detection", "yolo_detector.py")

# 1. Create the structured directory
os.makedirs(yolo_dir, exist_ok=True)
print(f"Created directory structure: {yolo_dir}")

# 2. Sweep any loose .pt weights downloaded during our previous tests into this safe location
moved_count = 0
for filename in os.listdir(backend_path):
    if filename.endswith(".pt"):
        src = os.path.join(backend_path, filename)
        dst = os.path.join(yolo_dir, filename)
        shutil.move(src, dst)
        print(f"Moved {filename} into models/yolo/")
        moved_count += 1

# 3. Enhance YoloDetector to resolve this explicit path robustly
with open(detector_file, "r", encoding="utf-8") as f:
    code = f.read()

# Replace the naive filename with a calculated path targeting the new directory
new_code = code.replace(
    'model_path: str = "yolo11n.pt"', 
    'model_path: str = "yolo11n.pt"'
).replace(
    'self.model = YOLO(self.model_path) if YOLO else None',
    '''if YOLO:
            # Construct absolute path pointing to backend/models/yolo
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
            absolute_path = os.path.join(base_dir, "models", "yolo", self.model_path)
            self.model_path = absolute_path
            
            # Auto-download on boot if it was entirely missing
            try:
                self.model = YOLO(self.model_path)
            except:
                self.model = YOLO("yolo11n.pt") # fallback mapping
        else:
            self.model = None'''
)

# Insert the missing OS module if it doesn't exist
if "import os" not in new_code:
    new_code = "import os\n" + new_code

with open(detector_file, "w", encoding="utf-8") as f:
    f.write(new_code)
    
print("Successfully mapped YoloDetector to the dedicated models/yolo storage space!")
