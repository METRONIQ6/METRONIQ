import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, get_db, engine, SessionLocal
from app.models.ecommerce import ECommerceMonitor
from app.api.deps import get_current_officer, get_current_user

client = TestClient(app)
Base.metadata.create_all(bind=engine)

def test_ecommerce_monitor_crud():
    class MockUser:
        id = uuid.uuid4()
        role = "OFFICER"
        
    app.dependency_overrides[get_current_officer] = lambda: MockUser()
    app.dependency_overrides[get_current_user] = lambda: MockUser()
    
    # Test Create
    res = client.post("/api/v1/ecommerce/", json={
        "target_url": "https://example.com/item",
        "monitoring_frequency": "DAILY"
    })
    
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["target_url"] == "https://example.com/item"
    assert data["status"] == "ACTIVE"
    
    monitor_id = data["id"]
    
    # Test Read
    res_get = client.get("/api/v1/ecommerce/")
    assert res_get.status_code == 200
    assert len([m for m in res_get.json() if m["id"] == monitor_id]) == 1
    
    # Test Scan Trigger
    res_scan = client.post(f"/api/v1/ecommerce/{monitor_id}/scan")
    assert res_scan.status_code == 200
    assert res_scan.json()["status"] == "SCAN_TRIGGERED"
    
    # Clean up
    db = SessionLocal()
    try:
        db.query(ECommerceMonitor).filter(ECommerceMonitor.id == uuid.UUID(monitor_id)).delete()
        db.commit()
    finally:
        db.close()
        
    app.dependency_overrides.clear()
    
def test_ssrf_protection():
    from app.services.crawler_service import validate_url, SSRFError
    
    # Validate schemes
    with pytest.raises(SSRFError, match="Unsupported scheme"):
        validate_url("file:///etc/passwd")
        
    with pytest.raises(SSRFError, match="Unsupported scheme"):
        validate_url("ftp://server/file")
        
    # Validate local IPs / lookups
    with pytest.raises(SSRFError, match="restricted IP"):
        validate_url("http://127.0.0.1/admin")
        
    with pytest.raises(SSRFError, match="restricted IP"):
        validate_url("http://localhost:8080/metrics")
        
    with pytest.raises(SSRFError, match="restricted IP"):
        validate_url("http://169.254.169.254/latest/meta-data/")
