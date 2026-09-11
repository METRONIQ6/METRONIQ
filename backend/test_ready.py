import requests

API_URL = "http://127.0.0.1:8000/api/v1"

# 1. Login
resp = requests.post(f"{API_URL}/auth/login", data={"username": "officer@metroniq.local", "password": "password", "grant_type": "password"})
assert resp.status_code == 200, f"Login failed: {resp.text}"
token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("Auth: PASS")

resp = requests.get(f"{API_URL}/rules", headers=headers)
assert resp.status_code == 200, f"Rules get failed: {resp.text}"
assert len(resp.json()) == 13, "Rule count mismatch"
print("Rules GET: PASS")

resp = requests.get(f"{API_URL}/inspections", headers=headers)
assert resp.status_code == 200, f"Inspections GET failed: {resp.text}"
assert len(resp.json()) == 307, "Inspections count mismatch"
print("Inspections GET: PASS")

resp = requests.get(f"{API_URL}/notices", headers=headers)
assert resp.status_code == 200, f"Notices GET failed: {resp.text}"
print("Notices GET: PASS")

print("All PostgreSQL integration tests passed.")
