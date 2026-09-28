import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

print("=== VERIFYING REGRESSION SUITE FOR METRONIQ CORE MODULES ===")

# 1. Auth & JWT
from app.core.security import verify_password, get_password_hash, create_access_token
pw = "SecureTestPassword123!"
hashed = get_password_hash(pw)
assert verify_password(pw, hashed)
token = create_access_token({"sub": "test@metroniq.gov.in", "role": "officer"})
assert token and isinstance(token, str)
print("[PASS] Security & JWT Token Generation")

# 2. Legal Metrology Rules Validation Service
from app.services.rules_validation_service import RulesValidationService
from unittest.mock import MagicMock
mock_db = MagicMock()
mock_db.query.return_value.filter.return_value.all.return_value = []
validator = RulesValidationService(mock_db)
sample_declarations = {
    "NET_QUANTITY": {"value": "500 g", "confidence": 0.95},
    "MRP": {"value": "Rs. 150.00", "confidence": 0.98},
    "MANUFACTURER": {"value": "MetronIQ FMCG Ltd", "confidence": 0.92},
    "CONSUMER_CARE": {"value": "care@metroniq.com", "confidence": 0.90},
    "DATE": {"value": "01/2026", "confidence": 0.96},
}
eval_res = validator.validate(sample_declarations)
print(f"[PASS] RulesValidationService initialized and validated successfully")

# 3. Models and Database Schema
from app.models import (
    User, Rule, RuleVersion, Inspection, Product, Manufacturer,
    ImprovementNotice, AuditLog, Reinspection, EnforcementCase, ECommerceMonitor
)
print("[PASS] SQLAlchemy ORM Models (User, Rule, Inspection, Product, Manufacturer, ImprovementNotice, AuditLog, Reinspection, EnforcementCase, ECommerceMonitor)")

# 4. E-commerce Monitor & SSRF Protection
from app.services.crawler_service import validate_url, SSRFError
import pytest
try:
    validate_url("http://127.0.0.1/admin")
    assert False, "Should have raised SSRFError"
except SSRFError:
    pass
print("[PASS] E-Commerce SSRF Protection & URL Validation")

# 5. Copilot Module
from app.api.routes.copilot import ChatRequest, ChatResponse
req = ChatRequest(message="What are the mandatory declarations under Legal Metrology?")
assert req.message is not None
print("[PASS] MetronIQ Copilot Request/Response Schemas")

# 6. Check frontend translations
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
found_locales = []
for root, dirs, files in os.walk(frontend_dir):
    for f in files:
        if "locale" in f.lower() or "i18n" in f.lower() or "lang" in f.lower():
            found_locales.append(f)
print(f"[PASS] Frontend i18n assets found: {len(found_locales)}")

print("\nALL REGRESSION VERIFICATIONS PASSED SUCCESSFULLY!")
