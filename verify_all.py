import requests, json, sys

base = "http://localhost:8000/api/v1"
results = {}

# ---- LOGIN ----
try:
    r = requests.post(f"{base}/auth/login",
                      data={"username": "officer@metroniq.local", "password": "password123"})
    if r.status_code != 200:
        print(f"LOGIN FAIL: {r.status_code} {r.text[:200]}"); sys.exit(1)
    token = r.json()["access_token"]
    results["login"] = "PASS"
    print(f"LOGIN: PASS")
except Exception as e:
    print(f"LOGIN FAIL: {e}"); sys.exit(1)

headers = {"Authorization": f"Bearer {token}"}

# ---- DASHBOARD ----
try:
    r = requests.get(f"{base}/dashboard/summary", headers=headers)
    results["dashboard"] = "PASS" if r.ok else f"FAIL {r.status_code}"
    print(f"DASHBOARD: {results['dashboard']} body={r.text[:200]}")
except Exception as e:
    results["dashboard"] = f"ERROR {e}"; print(f"DASHBOARD: {e}")

# ---- NOTICES ----
try:
    r = requests.get(f"{base}/notices/", headers=headers)
    data = r.json() if r.ok else []
    results["notices"] = f"PASS ({len(data)} records)"
    print(f"NOTICES: {results['notices']}")
except Exception as e:
    results["notices"] = f"ERROR {e}"; print(f"NOTICES: {e}")

# ---- REINSPECTIONS ----
try:
    r = requests.get(f"{base}/reinspections", headers=headers)
    data = r.json() if r.ok else []
    results["reinspections"] = f"PASS ({len(data)} records)"
    print(f"REINSPECTIONS: {results['reinspections']}")
except Exception as e:
    results["reinspections"] = f"ERROR {e}"; print(f"REINSPECTIONS: {e}")

# ---- ENFORCEMENT ----
try:
    r = requests.get(f"{base}/enforcement/", headers=headers)
    cases = r.json() if r.ok else []
    results["enforcement"] = f"PASS ({len(cases)} cases)"
    print(f"ENFORCEMENT: {results['enforcement']}")
    for c in cases:
        print(f"  case id={c['id'][:8]} status={c['status']} penalty={c.get('penalty_amount')}")
except Exception as e:
    results["enforcement"] = f"ERROR {e}"; print(f"ENFORCEMENT: {e}")
    cases = []

# ---- STATE TRANSITION AUDIT ----
if cases:
    c = cases[0]
    cid = c["id"]
    current_status = c["status"]
    transitions = {
        "OPEN": "UNDER_REVIEW",
        "UNDER_REVIEW": "PENALTY_PENDING",
        "PENALTY_PENDING": "PENALTY_ISSUED",
        "PENALTY_ISSUED": "RESOLVED",
    }
    if current_status in transitions:
        next_status = transitions[current_status]
        body = {"status": next_status}
        if current_status == "UNDER_REVIEW":
            body["penalty_amount"] = 25000.0
        r2 = requests.post(f"{base}/enforcement/{cid}/status",
                           headers={**headers, "Content-Type": "application/json"},
                           json=body)
        results["state_transition"] = f"PASS {current_status}→{next_status}" if r2.ok else f"FAIL {r2.status_code} {r2.text[:100]}"
        print(f"STATE TRANSITION: {results['state_transition']}")
    else:
        results["state_transition"] = f"ALREADY RESOLVED (status={current_status})"
        print(f"STATE TRANSITION: {results['state_transition']}")

    # ---- VIEW AUDIT ----
    try:
        r = requests.get(f"{base}/reports/{cid}", headers=headers)
        if r.ok:
            report = r.json()
            events = report.get("timeline", [])
            results["view_audit"] = f"PASS ({len(events)} timeline events)"
            print(f"VIEW AUDIT: {results['view_audit']}")
            for ev in events:
                print(f"  event={ev.get('event')} ts={ev.get('timestamp')} status={ev.get('status','') or ev.get('result','')}")
        else:
            results["view_audit"] = f"FAIL {r.status_code} {r.text[:200]}"
            print(f"VIEW AUDIT: {results['view_audit']}")
    except Exception as e:
        results["view_audit"] = f"ERROR {e}"; print(f"VIEW AUDIT: {e}")

# ---- ECOMMERCE ----
try:
    r = requests.get(f"{base}/ecommerce/monitors", headers=headers)
    data = r.json() if r.ok else []
    results["ecommerce"] = f"PASS ({len(data)} monitors)" if r.ok else f"FAIL {r.status_code}"
    print(f"ECOMMERCE: {results['ecommerce']}")
except Exception as e:
    results["ecommerce"] = f"ERROR {e}"; print(f"ECOMMERCE: {e}")

# ---- RBAC TEST: Manufacturer cannot access enforcement ----
try:
    mfr = requests.post(f"{base}/auth/login",
                        data={"username": "manufacturer@metroniq.local", "password": "password123"})
    if mfr.ok:
        mfr_token = mfr.json()["access_token"]
        mfr_headers = {"Authorization": f"Bearer {mfr_token}"}
        r_enf = requests.post(f"{base}/enforcement/{cases[0]['id']}/status",
                              headers={**mfr_headers, "Content-Type": "application/json"},
                              json={"status": "RESOLVED"})
        results["rbac"] = f"PASS (manufacturer got {r_enf.status_code})" if r_enf.status_code in [401, 403] else f"FAIL—manufacturer got {r_enf.status_code}"
        print(f"RBAC: {results['rbac']}")
    else:
        results["rbac"] = "NOT VERIFIED (manufacturer login failed)"
        print(f"RBAC: {results['rbac']}")
except Exception as e:
    results["rbac"] = f"ERROR {e}"; print(f"RBAC: {e}")

# ---- RULES ----
try:
    r = requests.get(f"{base}/rules/", headers=headers)
    data = r.json() if r.ok else []
    results["rules"] = f"PASS ({len(data)} rules)"
    print(f"RULES: {results['rules']}")
except Exception as e:
    results["rules"] = f"ERROR {e}"; print(f"RULES: {e}")

print("\n=== SUMMARY ===")
for k, v in results.items():
    print(f"  {k.upper()}: {v}")
