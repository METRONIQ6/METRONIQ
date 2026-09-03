import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, get_db, engine, SessionLocal
from app.models.inspection import Inspection
from app.models.reinspection import Reinspection
from app.models.notice import ImprovementNotice
from app.models.enforcement import EnforcementCase
from app.api.deps import get_current_officer, get_current_user

client = TestClient(app)
Base.metadata.create_all(bind=engine)

def test_audit_report_generation():
    db = SessionLocal()
    try:
        orig = Inspection(id=f"TEST-INSP-{uuid.uuid4()}", result="FAIL")
        db.add(orig)
        db.commit()
        db.refresh(orig)
        
        notice = ImprovementNotice(inspection_id=orig.id, status="RECTIFICATION_SUBMITTED")
        db.add(notice)
        db.commit()
        db.refresh(notice)
        
        new_insp = Inspection(id=f"TEST-INSP-{uuid.uuid4()}", result="FAIL", is_reinspection=True, parent_inspection_id=orig.id)
        db.add(new_insp)
        db.commit()
        
        rein = Reinspection(
            id=uuid.uuid4(),
            original_inspection_id=orig.id,
            notice_id=notice.id,
            new_inspection_id=new_insp.id,
            status="COMPLETED"
        )
        db.add(rein)
        db.commit()
        
        case = EnforcementCase(
            reinspection_id=rein.id,
            original_inspection_id=orig.id,
            status="OPEN"
        )
        db.add(case)
        db.commit()
        
        case_id = str(case.id)
        orig_id_str = orig.id
        notice_id_str = str(notice.id)
        rein_id_str = str(rein.id)
    finally:
        db.close()
        
    class MockUser:
        id = uuid.uuid4()
        role = "OFFICER"
        
    app.dependency_overrides[get_current_officer] = lambda: MockUser()
    app.dependency_overrides[get_current_user] = lambda: MockUser()
    
    response = client.get(f"/api/v1/reports/{case_id}")
    assert response.status_code == 200, response.text
    
    data = response.json()
    assert data["case_id"] == case_id
    assert data["inspection"]["id"] == orig_id_str
    assert data["notice"]["id"] == notice_id_str
    assert data["reinspection"]["id"] == rein_id_str
    assert len(data["timeline"]) > 0
    
    events = [e["event"] for e in data["timeline"]]
    assert "INSPECTION" in events
    assert "NOTICE_ISSUED" in events
    assert "REINSPECTION_COMPLETED" in events
    assert "ENFORCEMENT_ESCALATED" in events
    
    # Cleanup
    db = SessionLocal()
    try:
        db.delete(db.query(EnforcementCase).filter_by(id=uuid.UUID(case_id)).first())
        db.delete(db.query(Reinspection).filter_by(id=uuid.UUID(rein_id_str)).first())
        db.delete(db.query(ImprovementNotice).filter_by(id=uuid.UUID(notice_id_str)).first())
        for r_insp_id in db.query(Inspection.id).filter_by(parent_inspection_id=orig_id_str).all():
            db.delete(db.query(Inspection).filter_by(id=r_insp_id[0]).first())
        db.delete(db.query(Inspection).filter_by(id=orig_id_str).first())
        db.commit()
    finally:
        db.close()
        
    app.dependency_overrides.clear()
