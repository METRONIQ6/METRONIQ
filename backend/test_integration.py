import requests
import time

def test_integration():
    print("Testing upload...")
    with open("bus.jpg", "rb") as f:
        res = requests.post("http://127.0.0.1:8000/api/v1/scanner/upload", files={"file": f})
    
    data = res.json()
    scan_id = data["id"]
    print("Scan ID:", scan_id)
    
    print("Starting process...")
    requests.post(f"http://127.0.0.1:8000/api/v1/scanner/process?scan_id={scan_id}")
    
    for i in range(15):
        time.sleep(2)
        res = requests.get(f"http://127.0.0.1:8000/api/v1/scanner/{scan_id}/status")
        if res.status_code == 200:
            status = res.json()["status"]
            print("Status:", status)
            if status == "COMPLETED":
                break
        else:
            print("Status error", res.text)
            
    res = requests.get(f"http://127.0.0.1:8000/api/v1/scanner/{scan_id}/result")
    print("Result:", res.json())

if __name__ == "__main__":
    test_integration()
