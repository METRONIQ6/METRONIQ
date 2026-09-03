import json
from app.core.database import SessionLocal
from app.services.rules_validation_service import RulesValidationService

def test_validation():
    db = SessionLocal()
    try:
        service = RulesValidationService(db)
        
        # Test 1: Complete declarations against active rules
        decl_complete = {
            "NET_QUANTITY": {"value": "1 L", "confidence": 0.95},
            "MRP": {"value": "99", "confidence": 0.9},
            "MANUFACTURER": {"value": "AquaCorp", "confidence": 0.9}
        }
        res1 = service.validate(decl_complete)
        print("TEST 1 (Complete):", res1["compliance"])
        assert res1["compliance"] == "PARTIAL", f"Expected PARTIAL (missing rules), got {res1['compliance']}"
        assert res1["numerical_risk"] == 0, f"Expected numeric risk 0, got {res1['numerical_risk']}"
        
        # Test 2: Missing mandatory field (net_quantity requires True per DB)
        decl_missing = {
            "MRP": {"value": "99", "confidence": 0.9}
        }
        res2 = service.validate(decl_missing)
        print("TEST 2 (Missing Net Quant):", res2["compliance"])
        assert res2["compliance"] == "FAIL", f"Expected FAIL, got {res2['compliance']}"
        assert "NET_QUANTITY" in [e["field"] for e in res2["evaluations"] if e["status"] == "FAIL"]
        
        # Test 3: Uncertain declaration (confidence < 0.5)
        decl_uncertain = {
            "NET_QUANTITY": {"value": "1 L", "confidence": 0.45},
        }
        res3 = service.validate(decl_uncertain)
        print("TEST 3 (Uncertain):", res3["compliance"])
        assert res3["compliance"] == "REVIEW_REQUIRED", f"Expected REVIEW_REQUIRED, got {res3['compliance']}"
        assert "NET_QUANTITY" in [e["field"] for e in res3["evaluations"] if e["status"] == "UNCERTAIN"]
        
        print("All local validation tests passed!")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_validation()
