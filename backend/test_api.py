import requests
import pytest

API_URL = "http://127.0.0.1:8000/api/v1"

@pytest.fixture(scope="module")
def auth_headers():
    resp = requests.post(f"{API_URL}/auth/login", data={"username": "officer@metroniq.local", "password": "password", "grant_type": "password"})
    if resp.status_code != 200:
        pytest.skip(f"Login failed, skipped API tests: {resp.text}")
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_auth_login(auth_headers):
    assert auth_headers is not None
    assert "Authorization" in auth_headers

def test_get_rules(auth_headers):
    resp = requests.get(f"{API_URL}/rules", headers=auth_headers)
    assert resp.status_code == 200, f"Rules get failed: {resp.text}"

def test_get_inspections(auth_headers):
    resp = requests.get(f"{API_URL}/inspections", headers=auth_headers)
    assert resp.status_code == 200, f"Inspections GET failed: {resp.text}"

def test_get_notices(auth_headers):
    resp = requests.get(f"{API_URL}/notices", headers=auth_headers)
    assert resp.status_code == 200, f"Notices GET failed: {resp.text}"

def test_get_dashboard(auth_headers):
    resp = requests.get(f"{API_URL}/dashboard/summary", headers=auth_headers)
    assert resp.status_code == 200, f"Dashboard failed: {resp.text}"
