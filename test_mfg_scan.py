import requests, json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def login(email, password="password"):
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    if res.status_code == 200:
        return res.json()["access_token"]
    return None

t_mfg = login("manufacturer@metroniq.local")
with open("real_product.jpg", "rb") as f:
    files = {"file": ("real_product.jpg", f, "image/jpeg")}
    res = requests.post(f"{BASE_URL}/scanner/upload", headers={"Authorization": f"Bearer {t_mfg}"}, files=files)
    print("Manufacturer Upload ->", res.status_code)

