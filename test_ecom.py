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

# Create a monitor
cr = requests.post(f"{base}/ecommerce/", headers=headers, json={"target_url": "https://example.com/product", "monitoring_frequency": "DAILY"})
if cr.status_code != 200:
    print("Failed to create monitor", cr.status_code, cr.text)
    exit(1)

monitor_id = cr.json()["id"]
print("Created Monitor:", monitor_id)

# Trigger Scan
trig = requests.post(f"{base}/ecommerce/{monitor_id}/scan", headers=headers)
print("Trigger res:", trig.status_code, trig.text)
