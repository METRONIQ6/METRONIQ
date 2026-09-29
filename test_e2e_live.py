import requests
import json
import time

BASE_URL = "https://metroniq-backend-production.up.railway.app"

def end_to_end_test():
    print("1. Registering test user")
    email = f"test_{int(time.time())}@metroniq.local"
    res = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={"email": email, "password": "password123!", "role": "MANUFACTURER"}
    )
    assert res.status_code in [200, 201], f"Register failed: {res.text}"

    print("2. Logging in")
    res = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": email, "password": "password123!"}
    )
    assert res.status_code == 200, f"Login failed: {res.text}"
    token = res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}

    print("3. Uploading real product image")
    image_path = "real_product.jpg" # A small image with text maybe? We should generate an image with text "MRP: Rs. 99"
    try:
        with open(image_path, "rb") as f:
            res = requests.post(
                f"{BASE_URL}/api/scanner/upload",
                headers=headers,
                files={"file": ("test_label.jpg", f, "image/jpeg")}
            )
            assert res.status_code == 200, f"Upload failed: {res.text}"
            scan_id = res.json()["id"]
            print(f"Scan ID: {scan_id}")
    except FileNotFoundError:
        print("Image not found. Exiting.")
        return

    print("4. Triggering processing")
    res = requests.post(
        f"{BASE_URL}/api/scanner/{scan_id}/process",
        headers=headers
    )
    assert res.status_code in [200, 202], f"Process failed: {res.text}"
    
    print("5. Polling for results")
    for _ in range(15):
        time.sleep(2)
        res = requests.get(
            f"{BASE_URL}/api/scanner/{scan_id}/status",
            headers=headers
        )
        status = res.json()["status"]
        print(f"Status: {status}")
        if status in ["COMPLETED", "FAILED"]:
            break

    print("6. Getting final result")
    res = requests.get(
        f"{BASE_URL}/api/scanner/{scan_id}/result",
        headers=headers
    )
    result = res.json()
    print("RESULT:", json.dumps(result, indent=2))

if __name__ == "__main__":
    end_to_end_test()
