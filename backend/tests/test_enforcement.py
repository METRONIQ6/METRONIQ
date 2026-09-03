import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, get_db, engine, SessionLocal
from app.models.inspection import Inspection
from app.models.reinspection import Reinspection
from app.models.enforcement import EnforcementCase

client = TestClient(app)
Base.metadata.create_all(bind=engine)

def test_enforcement_escalation():
    # Setup
    db = SessionLocal()
    try:
        # Create a mock failed reinspection (completed Reinspection + failed New Inspection)
        parent_id = f"TEST-INSP-{uuid.uuid4()}"
        new_fail_id = f"TEST-SCAN-{uuid.uuid4()}"
        
        parent_insp = Inspection(id=parent_id, result="FAIL")
        new_insp = Inspection(id=new_fail_id, result="FAIL", is_reinspection=True, parent_inspection_id=parent_id)
        
        db.add(parent_insp)
        db.add(new_insp)
        db.commit()
        
        rein = Reinspection(
            id=uuid.uuid4(),
            original_inspection_id=parent_id,
            status="COMPLETED",
            new_inspection_id=new_fail_id
        )
        db.add(rein)
        db.commit()
        
        rein_id_str = str(rein.id)
    finally:
        db.close()

    # Mock Auth
    from app.api.deps import get_current_officer, get_current_user
    class MockUser:
        id = uuid.uuid4()
        role = "OFFICER"
    
    app.dependency_overrides[get_current_officer] = lambda: MockUser()
    app.dependency_overrides[get_current_user] = lambda: MockUser()

    # Test Escalate Endpoint
    response = client.post("/api/v1/enforcement/escalate", json={"reinspection_id": rein_id_str})
    assert response.status_code == 200, response.text
    case_data = response.json()
    
    assert case_data["reinspection_id"] == rein_id_str
    assert case_data["status"] == "OPEN"
    assert "id" in case_data
    
    case_id = case_data["id"]
    
    # Test Duplicate Protection
    res_dup = client.post("/api/v1/enforcement/escalate", json={"reinspection_id": rein_id_str})
    assert res_dup.status_code == 409
    
    # Test Generic Get Cases
    res_get = client.get("/api/v1/enforcement/")
    assert res_get.status_code == 200
    assert len([c for c in res_get.json() if c["id"] == case_id]) == 1
    
    # Test Status Update
    res_update = client.post(f"/api/v1/enforcement/{case_id}/status", json={"status": "PENALTY_ISSUED", "penalty_amount": 500.0})
    assert res_update.status_code == 200
    assert res_update.json()["status"] == "PENALTY_ISSUED"
    assert res_update.json()["penalty_amount"] == 500.0

    # Cleanup
    db = SessionLocal()
    try:
        case_to_del = db.query(EnforcementCase).filter(EnforcementCase.id == uuid.UUID(case_id)).first()
        db.delete(case_to_del)
        rein_to_del = db.query(Reinspection).filter(Reinspection.id == uuid.UUID(rein_id_str)).first()
        db.delete(rein_to_del)
        insp_to_del = db.query(Inspection).filter(Inspection.id == new_fail_id).first()
        db.delete(insp_to_del)
        parent_to_del = db.query(Inspection).filter(Inspection.id == parent_id).first()
        db.delete(parent_to_del)
        db.commit()
    finally:
        db.close()
        
    app.dependency_overrides.clear()
