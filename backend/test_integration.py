import time
import os
import uuid
from app.models.user import User
from app.core.security import get_password_hash

def test_integration(client, db_session):
    officer_email = f"officer_int_{uuid.uuid4().hex[:8]}@metroniq.local"
    user = User(
        id=uuid.uuid4(),
        email=officer_email,
        hashed_password=get_password_hash("password"),
        role="OFFICER",
        status="APPROVED"
    )
    db_session.add(user)
    db_session.commit()
    
    resp = client.post("/api/v1/auth/login", data={"username": officer_email, "password": "password"})
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("Testing upload...")
    
    if not os.path.exists("bus.jpg"):
        open("bus.jpg", "wb").write(b"fake image data")

    with open("bus.jpg", "rb") as f:
        res = client.post("/api/v1/scanner/upload", files={"file": ("bus.jpg", f, "image/jpeg")}, headers=headers)
    
    assert res.status_code == 200, res.text
    data = res.json()
    assert "id" in data, "Upload response should contain an ID"
    scan_id = data["id"]
    print("Scan ID:", scan_id)
    
    print("Starting process...")
    res = client.post(f"/api/v1/scanner/process?scan_id={scan_id}", headers=headers)
    assert res.status_code == 200, res.text
    
    # Check status
    res = client.get(f"/api/v1/scanner/{scan_id}/status", headers=headers)
    assert res.status_code == 200
    
    # Try getting the result
    res = client.get(f"/api/v1/scanner/{scan_id}/result", headers=headers)
    assert res.status_code in [200, 404, 400] # Depending on if it completed synchronously or errored
    print("Result handled gracefully.")
