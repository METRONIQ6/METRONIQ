import requests
import json
import time

base = "http://localhost:8000/api/v1"

# Login
res = requests.post(f"{base}/auth/login", data={"username": "officer@metroniq.local", "password": "password123"})
if res.status_code != 200:
    print("Login Failed")
    exit(1)
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Get cases
enc = requests.get(f"{base}/enforcement", headers=headers)
cases = enc.json()

if not cases:
    print("No cases to test")
else:
    c = cases[0]
    print(f"Testing case: {c['id']}")
    
    # Manage
    man = requests.post(f"{base}/enforcement/{c['id']}/status", headers=headers, json={"status": "RESOLVED", "penalty_amount": 1500.0})
    print("Manage result:", man.status_code, man.text)
    
    # Audit
    aud = requests.get(f"{base}/reports/{c['id']}", headers=headers)
    print("Audit result:", aud.status_code, aud.text[:200] + "..." if len(aud.text)>200 else aud.text)

