import logging
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.rule import RuleVersion

logger = logging.getLogger("MetronIQ-RulesValidator")

class RulesValidationService:
    def __init__(self, db: Session):
        self.db = db
        self.target_fields = [
            "MRP", "NET_QUANTITY", "MANUFACTURER", "PACKER", "IMPORTER", "CONSUMER_CARE",
            "DATE", "BATCH", "PRODUCT_NAME"
        ]

    def validate(self, declarations: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates extracted declarations against active rules in the database.
        Returns a deterministic validation result and risk/status structure.
        """
        # Fetch active rules
        active_rules = self.db.query(RuleVersion).filter(RuleVersion.status == "ACTIVE").all()
        
        # Build an easy lookup for configured rules
        configured_field_rules = {}
        for ver in active_rules:
            if ver.logic_payload and "field" in ver.logic_payload:
                field = ver.logic_payload["field"].upper()
                configured_field_rules[field] = ver.logic_payload

        # Keep track of missing configs
        missing_rule_definitions = []
        
        # Validation outputs
        field_evaluations = []
        overall_compliance = "PASS"
        total_risk_score = 0
        
        for field in self.target_fields:
            evaluation = {
                "field": field,
                "status": "UNVERIFIED",
                "evidence": None,
                "message": ""
            }
            
            # 1. Did the CV pipeline extract this field?
            declared_data = declarations.get(field)
            
            if not declared_data:
                evaluation["evidence"] = "MISSING_FROM_PACKAGE"
            else:
                evaluation["evidence"] = declared_data.get("value")
                
            # 2. Check if we have an authoritative rule definition for this field
            rule_logic = configured_field_rules.get(field)
            
            # Applicability Inference
            is_imported = str(declarations.get("_META_IS_IMPORTED", {}).get("value", "False")) == "True"
            
            if field == "IMPORTER" and not is_imported:
                evaluation["status"] = "NOT_APPLICABLE"
                evaluation["message"] = f"Importer details not applicable for domestic products."
                field_evaluations.append(evaluation)
                continue
                
            if field == "PACKER" and is_imported:
                evaluation["status"] = "NOT_APPLICABLE"
                evaluation["message"] = f"Packer details often not strictly separated for imported products."
                field_evaluations.append(evaluation)
                continue
            
            if not rule_logic:
                missing_rule_definitions.append(field)
                evaluation["status"] = "PENDING_RULE_DEF"
                evaluation["message"] = f"Awaiting Legal Metrology rule definition for {field}"
                if overall_compliance == "PASS":
                     overall_compliance = "PARTIAL" # If there are unverified fields, it cannot be a strict PASS
            else:
                # We have a rule! Let's evaluate.
                is_required = rule_logic.get("required", False)
                if not declared_data:
                    if is_required:
                        evaluation["status"] = "FAIL"
                        evaluation["evidence"] = "No matching declaration detected after OCR verification."
                        evaluation["message"] = f"Required field {field} could not be verified."
                        overall_compliance = "FAIL"
                        total_risk_score += 50
                    else:
                        evaluation["status"] = "NOT_APPLICABLE"
                        evaluation["evidence"] = "Field not present"
                        evaluation["message"] = f"Field {field} is not required and not present."
                else:    
                    # Depending on OCR confidence, we might have an uncertain declaration
                    conf = declared_data.get("confidence", 0.0)
                    if conf < 0.35:  # Tolerance lowered slightly to accommodate rough Indian packaging prints
                        evaluation["status"] = "NOT_VERIFIED"
                        evaluation["evidence"] = f"OCR confidence ({conf:.2f}) insufficient to determine compliance."
                        evaluation["message"] = f"Manual review required for {field}."
                        if overall_compliance != "FAIL":
                            overall_compliance = "REVIEW_REQUIRED"
                        total_risk_score += 15
                    else:
                        evaluation["status"] = "PASS"
                        evaluation["evidence"] = declared_data.get("value")
                        evaluation["message"] = f"{field} successfully verified (Confidence: {conf*100:.0f}%)."

            field_evaluations.append(evaluation)
            
        risk_level = "LOW"
        if total_risk_score > 30 or overall_compliance == "FAIL":
            risk_level = "HIGH"
        elif total_risk_score > 0 or overall_compliance in ["REVIEW_REQUIRED", "PARTIAL"]:
            risk_level = "MEDIUM"
            
        return {
            "compliance": overall_compliance,
            "risk_score": risk_level,
            "numerical_risk": total_risk_score,
            "missing_rule_definitions": missing_rule_definitions,
            "evaluations": field_evaluations
        }
