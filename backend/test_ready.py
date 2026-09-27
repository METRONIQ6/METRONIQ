def test_endpoints_ready(client, db_session):
    # Setup test user for endpoints
    from app.models.user import User
    from app.core.security import get_password_hash
    import uuid
    
    officer_id = uuid.uuid4()
    user = User(
        id=officer_id,
        email="officer_ready@metroniq.local",
        hashed_password=get_password_hash("password"),
        role="OFFICER",
        status="APPROVED"
    )
    db_session.add(user)
    db_session.commit()

    resp = client.post("/api/v1/auth/login", data={"username": "officer_ready@metroniq.local", "password": "password"})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/rules", headers=headers)
    assert resp.status_code == 200, f"Rules get failed: {resp.text}"
    assert isinstance(resp.json(), list), "Should return a list of rules"

    resp = client.get("/api/v1/inspections", headers=headers)
    assert resp.status_code == 200, f"Inspections GET failed: {resp.text}"
    assert isinstance(resp.json(), list), "Should return a list of inspections"

    resp = client.get("/api/v1/notices", headers=headers)
    assert resp.status_code == 200, f"Notices GET failed: {resp.text}"
    assert isinstance(resp.json(), list), "Should return a list of notices"
