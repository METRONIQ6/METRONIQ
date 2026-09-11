import requests
import json
import time

API_URL = "http://127.0.0.1:8000/api/v1"
headers = {}

def print_step(name):
    print(f"\n======================================")
    print(f"[LIVE DEMO API] -> {name}")
    print(f"======================================")

print_step("AUTHENTICATION (officer@metroniq.local)")
resp = requests.post(f"{API_URL}/auth/login", data={"username": "officer@metroniq.local", "password": "password", "grant_type": "password"})
if resp.status_code == 200:
    token = resp.json().get("access_token")
    headers["Authorization"] = f"Bearer {token}"
    print("LOGIN: PASS")
    
    print_step("IMAGE UPLOAD & AI SCANNER (YOLO, OCR, RULES)")
    with open("test_label.jpg", "rb") as f:
        files = {"file": ("test_label.jpg", f, "image/jpeg")}
        print("Uploading test_label.jpg...")
        resp = requests.post(f"{API_URL}/scanner/upload", headers=headers, files=files)
        
        if resp.status_code == 200:
            data = resp.json()
            scan_id = data.get("scan_id")
            print(f"IMAGE UPLOAD: PASS (Scan ID: {scan_id})")
            
            print("Waiting for YOLO, PaddleOCR, and Rule Engine to complete (Checking status max 40s)...")
            status_data = None
            for _ in range(20):
                status_resp = requests.get(f"{API_URL}/scanner/{scan_id}/status", headers=headers)
                status_data = status_resp.json()
                print(f"Status: {status_data.get('status')}")
                if status_data.get('status') in ["COMPLETED", "FAILED"]:
                    break
                time.sleep(2)
            
            if status_data.get("status") == "COMPLETED":
                print("SCANNER: PASS")
                print("COMPLIANCE RESULT:", status_data.get("compliance_result"))
                print("RISK LEVEL:", status_data.get("risk_score"))
                print("DETAILED EVIDENCE PAYLOAD:")
                evidence = status_data.get("evidence", {})
                cv_data = evidence.get("computer_vision", {})
                
                print(f"\nYOLO:\n  Model: {cv_data.get('model_type')}\n  Is Valid Package: {cv_data.get('is_valid_image')}")
                print(f"  Detections: {cv_data.get('detections', [])}")
                
                print(f"\nOCR:\n  Characters Found: {len(cv_data.get('ocr_full_text', ''))}")
                print(f"  Snippet: {repr(cv_data.get('ocr_full_text', '')[:100])}")
                
                print(f"\nDECLARATION EXTRACTION:\n  {json.dumps(evidence.get('declarations', {}), indent=2)}")
                print(f"\nRULE ENGINE CHECK:\n  {json.dumps(evidence.get('validation', {}), indent=2)}")
            else:
                print("SCANNER: FAIL (Timeout or Error)")
        else:
            print(f"IMAGE UPLOAD: FAIL ({resp.status_code})")

    print_step("NOTICES")
    resp = requests.get(f"{API_URL}/notices/", headers=headers)
    if resp.status_code == 200:
        notices = resp.json()
        print(f"NOTICES FETCH: PASS (Found {len(notices)} notices)")
    else:
        print("NOTICES FETCH: FAIL")

    print_step("DASHBOARD METRICS")
    resp = requests.get(f"{API_URL}/dashboard/summary", headers=headers)
    if resp.status_code == 200:
        print(f"DASHBOARD: PASS -> {resp.json()}")
    else:
        print("DASHBOARD: FAIL")
else:
    print(f"LOGIN: FAIL ({resp.status_code} - {resp.text})")
