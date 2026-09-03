import requests
import json

base_url = "http://localhost:8000/api/v1"

def login(email, password):
    res = requests.post(f"{base_url}/auth/login", data={"username": email, "password": password})
    if res.status_code != 200:
        return None
    return res.json()["access_token"]

# 1. Login with Admin
admin_token = login("admin@metroniq.local", "password123")
officer_token = login("officer@metroniq.local", "password123")
manuf_token = login("manufacturer@metroniq.local", "password123")

print("Tokens retrieved:", admin_token, officer_token, manuf_token)

# 2. Test Admin Route with Manufacturer
res = requests.post(f"{base_url}/rules/", headers={"Authorization": f"Bearer {manuf_token}"}, json={"id": "test", "name": "Test", "category": "Test", "initial_logic": "{}"})
print("Manufacturer on Admin Route:", res.status_code)

res2 = requests.post(f"{base_url}/rules/", headers={"Authorization": f"Bearer {admin_token}"}, json={"id": "test", "name": "Test", "category": "Test", "initial_logic": "{}"})
print("Admin on Admin Route:", res2.status_code)

# 3. Test Officer Route with Manufacturer
res3 = requests.get(f"{base_url}/scanner/does-not-exist/status", headers={"Authorization": f"Bearer {manuf_token}"})
print("Manufacturer on Officer Route:", res3.status_code)
res4 = requests.get(f"{base_url}/scanner/does-not-exist/status", headers={"Authorization": f"Bearer {officer_token}"})
print("Officer on Officer Route:", res4.status_code)
