import requests, json, time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def login(email, password="password"):
    res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    return res.json()["access_token"]

t_officer = login("officer@metroniq.local")
m_id = "730313f7-165d-4f54-96a8-3888897a8133"

for i in range(20):
    res = requests.get(f"{BASE_URL}/ecommerce/{m_id}/status", headers={"Authorization": f"Bearer {t_officer}"})
    data = res.json()
    status = data.get("status")
    print(f"Status: {status}")
    if status in ["SUCCESS", "CRAWL_ERROR", "CRAWL_TIMEOUT", "SECURITY_BLOCKED", "NOT_PRODUCT_PAGE", "INVALID_URL", "FAIL_PROCESSING", "NON_COMPLIANT", "FAIL"]:
        if data.get("result"):
            print("Compliance:", data["result"].get("compliance"))
            print("Product Name:", data["result"].get("product"))
            print("Rules evaluated:", len(data["result"].get("rules", [])))
        elif data.get("error"):
            print("Error:", data.get("error"))
        break
    time.sleep(2)
