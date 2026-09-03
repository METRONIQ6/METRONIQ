"""
Scanner Pipeline valid vs invalid image test.
"""
import requests
import time

BASE = "http://localhost:8000/api/v1"

def test_image(img_path, label):
    print(f"\n--- TESTING {label}: {img_path} ---")
    login = requests.post(f"{BASE}/auth/login", data={"username": "officer@metroniq.local", "password": "password123"})
    h = {"Authorization": f"Bearer {login.json()['access_token']}"}
    
    with open(img_path, "rb") as f:
        up = requests.post(f"{BASE}/scanner/upload", headers=h, files={"file": ("img.jpg", f, "image/jpeg")})
    scan_id = up.json()["id"]
    
    requests.post(f"{BASE}/scanner/process?scan_id={scan_id}", headers=h)
    
    while True:
        time.sleep(2)
        sr = requests.get(f"{BASE}/scanner/{scan_id}/status", headers=h).json()
        if sr["status"] not in ("PROCESSING", "UPLOADED"):
            break
            
    res = requests.get(f"{BASE}/scanner/{scan_id}/result", headers=h).json()
    print(f"Compliance: {res.get('compliance')}")
    print(f"Risk: {res.get('risk_level')}")
    print(f"Declarations: {res.get('extracted_declarations')}")
    vd = res.get("validation_details", {})
    if vd.get("evaluations"):
        print(f"Evals: {len(vd['evaluations'])} rules checked.")
        for ev in vd['evaluations']:
            print(f"  {ev['field']}: {ev['status']} - {ev.get('message','')}")
    else:
        print(f"Message: {vd.get('message')}")

test_image('backend/uploads/valid_mock_label.jpg', 'VALID LABEL')
test_image('backend/uploads/invalid_logo.jpg', 'INVALID LOGO IMAGE')

