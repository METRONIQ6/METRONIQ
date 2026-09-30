import requests, json, time
import os

BASE_URL = "http://127.0.0.1:8000/api/v1"

def login(email, password="password"):
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    if res.status_code == 200:
        print(f"[{email}] -> LOGIN SUCCESS")
        return res.json()["access_token"]
    else:
        print(f"[{email}] -> LOGIN FAILED: {res.status_code}")
        return None

def test():
    print("Testing Logins...")
    t_admin = login("admin@metroniq.local")
    t_mfg = login("manufacturer@metroniq.local")
    t_officer = login("officer@metroniq.local")
    
    if not t_officer:
        print("Officer login failed, aborting rest.")
        return

    print("\nTesting Scan Pipeline as Officer...")
    upload_url = f"{BASE_URL}/scanner/upload"
    
    with open("real_product.jpg", "rb") as f:
        files = {"file": ("real_product.jpg", f, "image/jpeg")}
        res = requests.post(upload_url, headers={"Authorization": f"Bearer {t_officer}"}, files=files)
        
    print(f"Upload API -> {res.status_code}")
    if res.status_code != 200:
        print(res.text)
        return
        
    scan_id = res.json()["id"]
    print(f"Generated Scan ID: {scan_id}")
    
    res = requests.post(f"{BASE_URL}/scanner/process?scan_id={scan_id}", headers={"Authorization": f"Bearer {t_officer}"})
    print("Process API ->", res.status_code)
    
    # Poll result
    for i in range(15):
        res = requests.get(f"{BASE_URL}/scanner/{scan_id}/result", headers={"Authorization": f"Bearer {t_officer}"})
        if res.status_code == 200 and res.json().get("status") == "COMPLETED":
            data = res.json()
            print("Scan Completed! Compliance:", data.get("compliance", ""))
            print("Declarations found:", list(data.get("declarations", {}).keys()))
            break
        time.sleep(2)
        
    # Check PDF functionality correctly using /reports/{scan_id}/pdf
    pdf_url = f"{BASE_URL}/reports/{scan_id}/pdf"
    res = requests.get(pdf_url, headers={"Authorization": f"Bearer {t_officer}"})
    print(f"PDF Endpoint -> {res.status_code}, Length: {len(res.content)} bytes")
    
    if res.status_code == 200 and len(res.content) > 1000:
        print("PDF Gen SUCCESS!")

try:
    test()
except Exception as e:
    print(f"Exception: {e}")
