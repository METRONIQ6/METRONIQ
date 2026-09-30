import requests, time, sys

BASE_URL = "http://localhost:3000/api/v1"

def login(email, password="password"):
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    if res.status_code == 200:
        return res.json()["access_token"]
    raise Exception(f"Login failed for {email}: {res.status_code}")

print("--- FLOW 1: Manufacturer Direct Scan ---")
tok_mfg = login("manufacturer@metroniq.local")
with open("real_product.jpg", "rb") as f:
    res = requests.post(f"{BASE_URL}/scanner/upload", headers={"Authorization": f"Bearer {tok_mfg}"}, files={"file": ("real_product.jpg", f, "image/jpeg")})
    if res.status_code != 200: raise Exception(f"MFG Upload Failed: {res.text}")
    scan_id_mfg = res.json()["id"]

requests.post(f"{BASE_URL}/scanner/process?scan_id={scan_id_mfg}", headers={"Authorization": f"Bearer {tok_mfg}"})
for i in range(20):
    time.sleep(2)
    s = requests.get(f"{BASE_URL}/scanner/{scan_id_mfg}/status", headers={"Authorization": f"Bearer {tok_mfg}"}).json().get("status")
    if s == "COMPLETED": break
rez = requests.get(f"{BASE_URL}/scanner/{scan_id_mfg}/result", headers={"Authorization": f"Bearer {tok_mfg}"}).json()
print("MFG Result Compliance:", rez.get("compliance"))


print("\n--- FLOW 2: Officer Scanner ---")
tok_off = login("officer@metroniq.local")
with open("real_product.jpg", "rb") as f:
    res = requests.post(f"{BASE_URL}/scanner/upload", headers={"Authorization": f"Bearer {tok_off}"}, files={"file": ("real_product.jpg", f, "image/jpeg")})
    scan_id_off = res.json()["id"]

requests.post(f"{BASE_URL}/scanner/process?scan_id={scan_id_off}", headers={"Authorization": f"Bearer {tok_off}"})
for i in range(20):
    time.sleep(2)
    if requests.get(f"{BASE_URL}/scanner/{scan_id_off}/status", headers={"Authorization": f"Bearer {tok_off}"}).json().get("status") == "COMPLETED": break
rez = requests.get(f"{BASE_URL}/scanner/{scan_id_off}/result", headers={"Authorization": f"Bearer {tok_off}"}).json()
print("OFF Result Compliance:", rez.get("compliance"))
print("OFF Rules Evaluated:", len(rez.get("validation_details", {}).get("evaluations", [])))

print("\n--- FLOW 2.1: PDF Generation ---")
pdf_res = requests.get(f"{BASE_URL}/reports/{scan_id_off}/pdf", headers={"Authorization": f"Bearer {tok_off}"})
print(f"PDF Gen Status: {pdf_res.status_code}, Length: {len(pdf_res.content)}")


print("\n--- FLOW 3: Officer E-Commerce ---")
test_url = "https://world.openfoodfacts.org/product/3017620422003/nutella-ferrero"
res = requests.post(f"{BASE_URL}/ecommerce", json={"target_url": test_url}, headers={"Authorization": f"Bearer {tok_off}"})
m_id = res.json()["id"]

requests.post(f"{BASE_URL}/ecommerce/{m_id}/scan", headers={"Authorization": f"Bearer {tok_off}"})
for i in range(20):
    time.sleep(2)
    s_data = requests.get(f"{BASE_URL}/ecommerce/{m_id}/status", headers={"Authorization": f"Bearer {tok_off}"}).json()
    st = s_data.get("status")
    print("Ecom Status polled:", st)
    if st not in ["PROCESSING", "IDLE", "SCAN_TRIGGERED"]: break

print("Ecom Final Result:", st)
if s_data.get("result"): print("Ecom Compliance:", s_data["result"].get("compliance"))

print("\nALL OK")
