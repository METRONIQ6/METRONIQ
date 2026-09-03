import sys
import os

# Add backend to path so we can import app modules
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.append(backend_dir)

from app.ai.detection.yolo_detector import YoloDetector

detector = YoloDetector()
print(f"Loaded Model Type: {detector.model_type}")
print(f"Loaded Model Path: {detector.model_path}")
