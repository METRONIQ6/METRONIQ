import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, get_db
from sqlalchemy.orm import sessionmaker
import uuid

# Use an in-memory SQLite for testing or a separate test DB
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_rbac_flow():
    # We will just run against the live DB (or whatever DB engine is currently configured)
    # 1. Normal sign-up creates a Manufacturer account
    user1_email = f"test_man_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post("/api/v1/auth/register", json={"email": user1_email, "password": "password", "role": "MANUFACTURER"})
    assert res.status_code == 200, res.text
    assert res.json()["role"] == "MANUFACTURER"
    assert res.json()["status"] == "APPROVED"
    
    # 2. Public requests cannot create Admin by manipulating request
    user2_email = f"test_admin_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post("/api/v1/auth/register", json={"email": user2_email, "password": "password", "role": "ADMIN"})
    assert res.status_code == 403, "Should reject ADMIN role"

    # 3. New Officer Account remains pending and cannot log in
    user3_email = f"test_off_{uuid.uuid4().hex[:8]}@example.com"
    res = client.post("/api/v1/auth/register", json={"email": user3_email, "password": "password", "role": "OFFICER"})
    assert res.status_code == 200
    assert res.json()["role"] == "OFFICER"
    assert res.json()["status"] == "PENDING_APPROVAL"
    officer_id = res.json()["id"]

    # Try login as pending officer
    res = client.post("/api/v1/auth/login", data={"username": user3_email, "password": "password"})
    assert res.status_code == 403
    assert "Admin approval is required" in res.json()["detail"]

    # 4. A non-Admin cannot view the Admin user directory
    # Login as Manufacturer
    res = client.post("/api/v1/auth/login", data={"username": user1_email, "password": "password"})
    assert res.status_code == 200
    man_token = res.json()["access_token"]
    
    res = client.get("/api/v1/users/counts", headers={"Authorization": f"Bearer {man_token}"})
    assert res.status_code == 403

    # To test Admin features, let's create an Admin user directly in DB
    db = TestSessionLocal()
    from app.models.user import User
    from app.core.security import get_password_hash
    admin_email = f"admin_{uuid.uuid4().hex[:8]}@example.com"
    admin_user = User(email=admin_email, hashed_password=get_password_hash("password"), role="ADMIN", status="APPROVED")
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    db.close()

    # Login as Admin
    res = client.post("/api/v1/auth/login", data={"username": admin_email, "password": "password"})
    assert res.status_code == 200
    admin_token = res.json()["access_token"]

    # 5. Admin can view accurate database-backed counts
    res = client.get("/api/v1/users/counts", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    counts = res.json()
    assert counts["manufacturers"] >= 1
    assert counts["officers_pending"] >= 1

    # 6. Admin can approve or reject an Officer
    res = client.post(f"/api/v1/users/{officer_id}/approve", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    assert res.json()["status"] == "APPROVED"

    # Login should now work for the officer
    res = client.post("/api/v1/auth/login", data={"username": user3_email, "password": "password"})
    assert res.status_code == 200
    assert "access_token" in res.json()

    print("ALL TESTS PASSED: RBAC, Roles, Approval queues working as expected.")
    
if __name__ == "__main__":
    test_rbac_flow()
