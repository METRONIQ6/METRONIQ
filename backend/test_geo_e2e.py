"""
End-to-End Test Suite for MetronIQ Role-Scoped Geo Analytics.
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_geo_analytics():
    print("========================================")
    print("STARTING METRONIQ GEO ANALYTICS E2E TESTS")
    print("========================================")

    # 1. Login as Admin
    admin_login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@metroniq.local", "password": "password"})
    assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
    admin_token = admin_login_res.json()["access_token"]
    print("[PASS] 1. Admin Login Successful")

    # 2. Login as Demo Officer
    officer_login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "officer@metroniq.local", "password": "password"})
    assert officer_login_res.status_code == 200, f"Officer login failed: {officer_login_res.text}"
    officer_token = officer_login_res.json()["access_token"]
    print("[PASS] 2. Officer Login Successful")

    # 3. Login as Manufacturer
    mfg_login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "manufacturer@metroniq.local", "password": "password"})
    assert mfg_login_res.status_code == 200, f"Manufacturer login failed: {mfg_login_res.text}"
    mfg_token = mfg_login_res.json()["access_token"]
    print("[PASS] 3. Manufacturer Login Successful")

    # 4. Admin Geo Analytics (System-Wide)
    admin_geo_res = requests.get(
        f"{BASE_URL}/analytics/geo",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert admin_geo_res.status_code == 200, f"Admin geo failed: {admin_geo_res.text}"
    admin_data = admin_geo_res.json()
    assert admin_data["total_records"] > 0, "Admin should have geographic records"
    assert admin_data["jurisdictions_count"] > 0, "Admin should have active jurisdictions"
    assert "summary" in admin_data, "Summary missing in admin geo response"
    assert "jurisdictions" in admin_data, "Jurisdictions missing in admin geo response"
    assert "points" in admin_data, "Points missing in admin geo response"
    assert admin_data["role_scope"] == "ADMIN", "Role scope should be ADMIN"

    # Verify coordinates in admin data
    for j in admin_data["jurisdictions"]:
        assert isinstance(j["latitude"], (int, float)), f"Invalid latitude for {j['jurisdiction']}"
        assert isinstance(j["longitude"], (int, float)), f"Invalid longitude for {j['jurisdiction']}"
        assert j["total_inspections"] > 0, f"Zero inspections for {j['jurisdiction']}"
    print(f"[PASS] 4. Admin Geo Analytics Verified: {admin_data['total_records']} records across {admin_data['jurisdictions_count']} jurisdictions")

    # 5. Officer Geo Analytics (Officer-Scoped)
    officer_geo_res = requests.get(
        f"{BASE_URL}/analytics/geo",
        headers={"Authorization": f"Bearer {officer_token}"}
    )
    assert officer_geo_res.status_code == 200, f"Officer geo failed: {officer_geo_res.text}"
    officer_data = officer_geo_res.json()
    assert officer_data["total_records"] > 0, "Officer should have geographic records"
    assert officer_data["jurisdictions_count"] > 0, "Officer should have active jurisdictions"
    assert officer_data["role_scope"] == "OFFICER", "Role scope should be OFFICER"

    # Verify coordinates in officer data
    for j in officer_data["jurisdictions"]:
        assert isinstance(j["latitude"], (int, float)), f"Invalid latitude for {j['jurisdiction']}"
        assert isinstance(j["longitude"], (int, float)), f"Invalid longitude for {j['jurisdiction']}"
    print(f"[PASS] 5. Officer Geo Analytics Verified: {officer_data['total_records']} records across {officer_data['jurisdictions_count']} jurisdictions")

    # 6. Manufacturer Access Rejection (403)
    mfg_geo_res = requests.get(
        f"{BASE_URL}/analytics/geo",
        headers={"Authorization": f"Bearer {mfg_token}"}
    )
    assert mfg_geo_res.status_code == 403, f"Expected 403 for Manufacturer, got {mfg_geo_res.status_code}"
    print("[PASS] 6. Manufacturer RBAC rejection verified (403 Forbidden)")

    # 7. Unauthenticated Rejection (401)
    unauth_geo_res = requests.get(f"{BASE_URL}/analytics/geo")
    assert unauth_geo_res.status_code == 401, f"Expected 401 for unauthenticated, got {unauth_geo_res.status_code}"
    print("[PASS] 7. Unauthenticated access rejected (401 Unauthorized)")

    # 8. Test New User / Officer Isolation
    signup_email = "test_isolated_officer@metroniq.local"
    from app.core.database import SessionLocal
    from app.models.user import User
    from app.core.security import get_password_hash
    import uuid

    db = SessionLocal()
    existing_iso = db.query(User).filter(User.email == signup_email).first()
    if not existing_iso:
        iso_user = User(
            id=uuid.uuid4(),
            email=signup_email,
            hashed_password=get_password_hash("password123"),
            role="OFFICER",
            status="APPROVED"
        )
        db.add(iso_user)
        db.commit()
    db.close()

    iso_login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": signup_email, "password": "password123"})
    assert iso_login_res.status_code == 200, f"Isolated officer login failed: {iso_login_res.text}"
    iso_token = iso_login_res.json()["access_token"]

    iso_geo_res = requests.get(
        f"{BASE_URL}/analytics/geo",
        headers={"Authorization": f"Bearer {iso_token}"}
    )
    assert iso_geo_res.status_code == 200
    iso_data = iso_geo_res.json()
    assert iso_data["total_records"] == 0, f"New officer must have 0 records, got {iso_data['total_records']}"
    assert iso_data["jurisdictions_count"] == 0, f"New officer must have 0 jurisdictions, got {iso_data['jurisdictions_count']}"
    assert len(iso_data["jurisdictions"]) == 0, "Jurisdictions array must be empty"
    assert len(iso_data["points"]) == 0, "Points array must be empty"
    print("[PASS] 8. New Officer Isolation Verified (Zero demo data leakage)")

    # 9. Regression check - Existing endpoints
    overview_res = requests.get(f"{BASE_URL}/analytics/overview")
    assert overview_res.status_code == 200
    trends_res = requests.get(f"{BASE_URL}/analytics/trends?days=7")
    assert trends_res.status_code == 200
    rules_res = requests.get(f"{BASE_URL}/rules", headers={"Authorization": f"Bearer {admin_token}"})
    assert rules_res.status_code == 200
    print("[PASS] 9. Analytics Overview, Trends, and Rules API Regression Passed")

    print("========================================")
    print("ALL GEO ANALYTICS TESTS PASSED (9/9)")
    print("========================================")

if __name__ == "__main__":
    test_geo_analytics()
