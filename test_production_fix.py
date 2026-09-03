import requests
import json
import time

s = requests.Session()
# 1. Login
res = s.post("http://localhost:8000/api/v1/auth/login", data={"username": "officer@metroniq.local", "password": "password123"})
print("LOGIN:", res.status_code)
assert res.status_code == 200
token = res.json()["access_token"]
print("TOKEN OK")

# 2. Check Auth Dependency directly
headers = {"Authorization": f"Bearer {token}"}
res = s.get("http://localhost:8000/api/v1/inspections/", headers=headers)
print("INSPECTIONS:", res.status_code)
if res.status_code == 200:
    print(len(res.json()), "records")
else:
    print("FAILED:", res.text)

# 3. Trigger E-Commerce Scan
res = s.post("http://localhost:8000/api/v1/ecommerce/", json={"target_url": "https://example.com", "monitoring_frequency": "DAILY"}, headers=headers)
print("ECOMMERCE:", res.status_code)
if res.status_code == 200:
    data = res.json()
    e_id = data["id"]
    res = s.post(f"http://localhost:8000/api/v1/ecommerce/{e_id}/scan", headers=headers)
    print("ECOMMERCE TRIGGER SCAN:", res.status_code, res.json())
    
# 4. Check Enforcement
cases = s.get("http://localhost:8000/api/v1/enforcement/", headers=headers)
print("ENFORCEMENT CASES:", cases.status_code)

