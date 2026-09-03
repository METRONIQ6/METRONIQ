"""
Manufacturer Rectification API Verification
Tests: Manufacturer login → fetch notices → POST rectify → confirm state change
"""
import requests

BASE = "http://localhost:8000/api/v1"

print("=" * 60)
print("MANUFACTURER RECTIFICATION VERIFICATION")
print("=" * 60)

# --- LOGIN AS MANUFACTURER ---
mfr_login = requests.post(f"{BASE}/auth/login",
    data={"username": "manufacturer@metroniq.local", "password": "password123"})
print(f"Manufacturer login: {mfr_login.status_code}")
if not mfr_login.ok:
    print(f"  Body: {mfr_login.text[:200]}")
    exit(1)
mfr_token = mfr_login.json()["access_token"]
mfr_h = {"Authorization": f"Bearer {mfr_token}"}
print("MANUFACTURER LOGIN: PASS")

# --- FETCH NOTICES AS MANUFACTURER ---
notices_resp = requests.get(f"{BASE}/notices/", headers=mfr_h)
print(f"\nNotices fetch: {notices_resp.status_code}")
if notices_resp.ok:
    notices = notices_resp.json()
    print(f"  Total notices: {len(notices)}")
    for n in notices:
        print(f"  notice id={n['id'][:8]} status={n['status']} insp={n.get('inspection_id','')[:20]}")
else:
    notices = []
    print(f"  FAIL: {notices_resp.text[:200]}")

# --- FIND AN ISSUED NOTICE TO RECTIFY ---
issued = [n for n in notices if n.get("status") == "ISSUED"]
print(f"  ISSUED notices: {len(issued)}")

if issued:
    target = issued[0]
    nid = target["id"]
    print(f"\nRectifying notice {nid[:8]}...")
    
    rectify_resp = requests.post(
        f"{BASE}/notices/{nid}/rectify",
        headers={**mfr_h, "Content-Type": "application/json"},
        json={"remarks": "Label corrected - net weight and manufacturer details updated"}
    )
    print(f"  Rectify POST: {rectify_resp.status_code}")
    if rectify_resp.ok:
        rd = rectify_resp.json()
        print(f"  New status: {rd.get('status')}")
        print(f"  Notice id: {rd.get('id')}")
        print("RECTIFICATION: PASS")
        
        # Verify state change persisted
        verify_resp = requests.get(f"{BASE}/notices/", headers=mfr_h)
        if verify_resp.ok:
            updated = [n for n in verify_resp.json() if n["id"] == nid]
            if updated:
                print(f"\nPersistence check — notice status after rectify: {updated[0]['status']}")
                if updated[0]["status"] == "RECTIFICATION_SUBMITTED":
                    print("RECTIFICATION PERSISTENCE: PASS")
                else:
                    print(f"RECTIFICATION PERSISTENCE: UNEXPECTED STATUS {updated[0]['status']}")
    else:
        print(f"  RECTIFY FAIL: {rectify_resp.text[:300]}")
else:
    print("\nNo ISSUED notices found to rectify — all already submitted or none exist.")
    # Check if there are any notices at all
    all_statuses = list(set(n.get("status") for n in notices))
    print(f"  Available notice statuses: {all_statuses}")
    print("RECTIFICATION: NOT VERIFIED (no ISSUED notice available)")

# --- RBAC: Officer cannot rectify ---
print("\n--- RBAC: Officer attempting rectification ---")
off_login = requests.post(f"{BASE}/auth/login",
    data={"username": "officer@metroniq.local", "password": "password123"})
off_token = off_login.json()["access_token"]
off_h = {"Authorization": f"Bearer {off_token}"}

if issued:
    # Try to rectify with officer token (should fail or succeed depending on RBAC config)
    test_nid = notices[0]["id"]
    rbac_resp = requests.post(
        f"{BASE}/notices/{test_nid}/rectify",
        headers={**off_h, "Content-Type": "application/json"},
        json={"remarks": "RBAC test"}
    )
    print(f"  Officer rectify attempt: {rbac_resp.status_code}")
    # 403 would be correct, 200 means no RBAC on this endpoint
    if rbac_resp.status_code == 403:
        print("  RBAC: PASS (officer blocked)")
    elif rbac_resp.status_code == 200:
        print("  RBAC WARNING: officer can rectify (endpoint has no role restriction)")
    elif rbac_resp.status_code == 400:
        print(f"  NOTE: 400 (notice already rectified or invalid state) — {rbac_resp.text[:100]}")
    else:
        print(f"  UNEXPECTED: {rbac_resp.status_code} {rbac_resp.text[:100]}")

print("\n" + "=" * 60)
print("DONE")
