import pytest
from app.models.user import User
from app.core.security import get_password_hash
import uuid

@pytest.fixture(scope="function")
def auth_headers(client, db_session):
    officer_id = uuid.uuid4()
    officer_email = f"officer_api_{uuid.uuid4().hex[:8]}@metroniq.local"
    user = User(
        id=officer_id,
        email=officer_email,
        hashed_password=get_password_hash("password"),
        role="OFFICER",
        status="APPROVED"
    )
    db_session.add(user)
    db_session.commit()

    resp = client.post("/api/v1/auth/login", data={"username": officer_email, "password": "password"})
    assert resp.status_code == 200, f"Login failed, skipped API tests: {resp.text}"
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_auth_login(auth_headers):
    assert auth_headers is not None
    assert "Authorization" in auth_headers

def test_get_rules(client, auth_headers):
    resp = client.get("/api/v1/rules", headers=auth_headers)
    assert resp.status_code == 200, f"Rules get failed: {resp.text}"

def test_get_inspections(client, auth_headers):
    resp = client.get("/api/v1/inspections", headers=auth_headers)
    assert resp.status_code == 200, f"Inspections GET failed: {resp.text}"

def test_get_notices(client, auth_headers):
    resp = client.get("/api/v1/notices", headers=auth_headers)
    assert resp.status_code == 200, f"Notices GET failed: {resp.text}"

def test_get_dashboard(client, auth_headers):
    resp = client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert resp.status_code == 200, f"Dashboard failed: {resp.text}"
