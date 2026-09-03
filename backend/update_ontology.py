import os

backend_dir = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend"
detector_file = os.path.join(backend_dir, "app", "ai", "detection", "yolo_detector.py")
mlops_dir = os.path.join(backend_dir, "mlops")

# 1. Update the YoloDetector to strictly honor the new 6-class MetronIQ Ontology
with open(detector_file, "r", encoding="utf-8") as f:
    code = f.read()

# Swap out the old 4-class mocked array for the exact explicit 6-class bounds
old_array = """        self.target_compliance_classes = [
            "mrp_area", 
            "net_quantity_area", 
            "manufacturer_area", 
            "consumer_care_area"
        ]"""

new_array = """        self.target_compliance_classes = [
            "MRP",
            "NET_QUANTITY",
            "MANUFACTURER",
            "CONSUMER_CARE",
            "IMPORTER",
            "PACKER"
        ]"""

modified_code = code.replace(old_array, new_array)

with open(detector_file, "w", encoding="utf-8") as f:
    f.write(modified_code)

# 2. Scaffold the Training Dataset Architecture for the YOLO Fine-Tuning Phase
os.makedirs(mlops_dir, exist_ok=True)
data_yaml_path = os.path.join(mlops_dir, "metroniq_dataset.yaml")

yaml_content = """# MetronIQ Custom YOLOv11/v8 Dataset Configuration
# Architecture mapped exactly per Data Engineering Workflow Requirements

path: ../datasets/metroniq
train: images/train
val: images/val
test: images/test

# 6 Core Classes
nc: 6
names:
  0: MRP
  1: NET_QUANTITY
  2: MANUFACTURER
  3: CONSUMER_CARE
  4: IMPORTER
  5: PACKER
"""

with open(data_yaml_path, "w", encoding="utf-8") as yf:
    yf.write(yaml_content)

print("Ontology mapped and MLOps yaml formally scaffolded.")
