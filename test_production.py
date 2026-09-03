import requests
import json
import time

s = requests.Session()
res = s.post("http://localhost:8000/api/v1/auth/login", data={"username": "officer@metroniq.local", "password": "password123"})
print("LOGIN:", res.status_code)
if res.status_code == 200:
    token = res.json()["access_token"]
    print("TOKEN OK")
    
    # Check inspections
    res = s.get("http://localhost:8000/api/v1/inspections/", headers={"Authorization": f"Bearer {token}"})
    print("INSPECTIONS:", res.status_code, len(res.json()))
    
    # E-Commerce scanner
    res = s.post("http://localhost:8000/api/v1/ecommerce/", json={"target_url": "https://example.com", "monitoring_frequency": "DAILY"}, headers={"Authorization": f"Bearer {token}"})
    print("ECOMMERCE:", res.status_code)
    
    cases = s.get("http://localhost:8000/api/v1/enforcement/", headers={"Authorization": f"Bearer {token}"})
    print("ENFORCEMENT CASES:", cases.status_code, len(cases.json()))

