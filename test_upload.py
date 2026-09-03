import requests
import json
import time

s = requests.Session()
# 1. Login
res = s.post("http://localhost:8000/api/v1/auth/login", data={"username": "officer@metroniq.local", "password": "password123"})
assert res.status_code == 200, res.text
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Upload an image
# Create a dummy image
from PIL import Image
img = Image.new('RGB', (100, 100), color = (73, 109, 137))
img.save('test_label.jpg')

with open("test_label.jpg", "rb") as f:
    upload_res = s.post("http://localhost:8000/api/v1/scanner/upload", files={"file": f}, headers=headers)

if upload_res.status_code != 200:
    print("UPLOAD FAILED:", upload_res.text)
    exit(1)
    
scan_id = upload_res.json()["id"]
print("Scan ID:", scan_id)

# 3. Process
process_res = s.post(f"http://localhost:8000/api/v1/scanner/process?scan_id={scan_id}", headers=headers)
print("PROCESS:", process_res.status_code, process_res.text)

status = "PROCESSING"
while status in ["PROCESSING", "UPLOADED"]:
    time.sleep(1)
    status_res = s.get(f"http://localhost:8000/api/v1/scanner/{scan_id}/status", headers=headers)
    status = status_res.json()["status"]
    print("STATUS:", status)

# 4. Result
result_res = s.get(f"http://localhost:8000/api/v1/scanner/{scan_id}/result", headers=headers)
print("RESULT:", result_res.status_code, result_res.json())
