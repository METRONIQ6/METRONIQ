import httpx
import json
import time

BASE_URL = "https://metroniq-backend-production.up.railway.app"

def run_trace():
    print("--- TRACE: START ---")
    with httpx.Client(base_url=BASE_URL, timeout=60.0) as client:
        # 1. Login
        resp_login = client.post("/api/v1/auth/login", data={"username": "officer@metroniq.local", "password": "password123"})
        if resp_login.status_code != 200:
            print(f"Login Failed: {resp_login.status_code} {resp_login.text}")
            return
        
        token = resp_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Logged in successfully.")
        
        # 2. Upload
        with open("backend/bus.jpg", "rb") as f:
            resp_up = client.post("/api/v1/scanner/upload", files={"file": ("bus.jpg", f, "image/jpeg")}, headers=headers)
            
        print(f"Upload Status: {resp_up.status_code}")
        print(f"Upload Response: {resp_up.text}")
        if resp_up.status_code != 200:
            return
            
        scan_id = resp_up.json()["id"]
        
        # 3. DB Check via status (fallback)
        resp_stat0 = client.get(f"/api/v1/scanner/{scan_id}/status", headers=headers)
        print(f"Status before process: {resp_stat0.status_code} -> {resp_stat0.text}")
        
        # 4. Process
        print("Triggering /process...")
        try:
            resp_proc = client.post(f"/api/v1/scanner/process?scan_id={scan_id}", headers=headers, timeout=60.0)
            print(f"Process Status: {resp_proc.status_code}")
            print(f"Process Response: {resp_proc.text}")
        except Exception as e:
            print(f"Process Exception: {e}")
            
        # 5. Polling
        for i in range(5):
            time.sleep(2)
            resp_stat = client.get(f"/api/v1/scanner/{scan_id}/status", headers=headers)
            print(f"Poll {i} Status: {resp_stat.status_code} -> {resp_stat.text}")
            if "COMPLETED" in resp_stat.text or "FAILED" in resp_stat.text:
                break
                
        # 6. Result
        resp_res = client.get(f"/api/v1/scanner/{scan_id}/result", headers=headers)
        print(f"Result length: {len(resp_res.text)}")
        if resp_res.status_code == 200:
            print(f"Result Compliance: {resp_res.json().get('compliance')}")
        else:
            print(f"Result Error: {resp_res.status_code} -> {resp_res.text}")

if __name__ == "__main__":
    run_trace()
