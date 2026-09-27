import uuid
from app.models.user import User
from app.core.security import get_password_hash

def test_rbac_flow(client, db_session):
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
    res = client.post("/api/v1/auth/login", data={"username": user1_email, "password": "password"})
    assert res.status_code == 200
    man_token = res.json()["access_token"]
    
    res = client.get("/api/v1/users/counts", headers={"Authorization": f"Bearer {man_token}"})
    assert res.status_code == 403

    # To test Admin features, create an Admin user directly in DB
    admin_email = f"admin_{uuid.uuid4().hex[:8]}@example.com"
    admin_user = User(id=uuid.uuid4(), email=admin_email, hashed_password=get_password_hash("password"), role="ADMIN", status="APPROVED")
    db_session.add(admin_user)
    db_session.commit()
    db_session.refresh(admin_user)

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
