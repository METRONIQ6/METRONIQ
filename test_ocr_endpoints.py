import sys
import os
sys.path.insert(0, '/mnt/c/Users/balag/.gemini/antigravity/scratch/MetronIQ/ocr_service')

from fastapi.testclient import TestClient
import main

client = TestClient(main.app)

# 1. Test GET /
res_root = client.get("/")
print("GET / ->", res_root.status_code, res_root.json())
assert res_root.status_code == 200
assert res_root.json()["service"] == "metroniq-ocr"

# 2. Test GET /health
res_health = client.get("/health")
print("GET /health ->", res_health.status_code, res_health.json())
assert res_health.status_code == 200
assert res_health.json() == {"status": "ok", "service": "metroniq-ocr"}

# 3. Test POST /ocr/extract with real test image
img_path = "/mnt/c/Users/balag/.gemini/antigravity/scratch/MetronIQ/backend/app/temp_uploads/INSP-8B89C307.jpg"
if not os.path.exists(img_path):
    img_path = "/mnt/c/Users/balag/.gemini/antigravity/scratch/MetronIQ/backend/mlops/dataset/images/train/10.png"

with open(img_path, "rb") as f:
    files = {"file": ("test.jpg", f.read(), "image/jpeg")}

res_ocr = client.post("/ocr/extract", files=files)
print("POST /ocr/extract ->", res_ocr.status_code)
data = res_ocr.json()
print("Status:", data.get("status"))
print("Extracted count:", data.get("count"))
results = data.get("results", [])
print(f"Sample results (first 5 of {len(results)}):")
for r in results[:5]:
    print("  ", r)

assert res_ocr.status_code == 200
assert data.get("status") == "success"
assert len(results) > 0
for r in results:
    assert "text" in r
    assert "confidence" in r
    assert "bounding_box" in r
    assert len(r["bounding_box"]) == 4

print("\nSTEP 1 FULL VERIFICATION SUCCEEDED: /health AND /ocr/extract PASSED WITH REAL IMAGE DATA!")
