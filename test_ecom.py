import requests, json, time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def login(email, password="password"):
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    if res.status_code == 200:
        return res.json()["access_token"]
    return None

t_officer = login("officer@metroniq.local")
test_url = "https://world.openfoodfacts.org/product/3017620422003/nutella-ferrero"

print("1. Creating monitor...")
res = requests.post(f"{BASE_URL}/ecommerce", json={"target_url": test_url}, headers={"Authorization": f"Bearer {t_officer}"})
monitor = res.json()
print("Monitor ID:", monitor["id"])

print("2. Triggering scan...")
m_id = monitor["id"]
res = requests.post(f"{BASE_URL}/ecommerce/{m_id}/scan", headers={"Authorization": f"Bearer {t_officer}"})
print("Trigger Status:", res.status_code)

print("3. Polling status...")
for i in range(20):
    time.sleep(2)
    res = requests.get(f"{BASE_URL}/ecommerce/{m_id}/status", headers={"Authorization": f"Bearer {t_officer}"})
    data = res.json()
    status = data.get("status")
    print(f"Status: {status}")
    if status in ["SUCCESS", "CRAWL_ERROR", "CRAWL_TIMEOUT", "SECURITY_BLOCKED", "NOT_PRODUCT_PAGE", "INVALID_URL", "FAIL_PROCESSING", "NON_COMPLIANT"]:
        if data.get("result"):
            print("Compliance:", data["result"].get("compliance"))
            print("Product Name:", data["result"].get("product"))
            print("Rules evaluated:", len(data["result"].get("rules", [])))
        break
