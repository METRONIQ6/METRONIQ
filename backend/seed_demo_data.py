"""
Idempotent Demo Data Seeder for MetronIQ.
Seeds realistic fictional data ONLY into the THREE EXISTING DEMO ACCOUNTS:
1. admin@metroniq.local
2. manufacturer@metroniq.local
3. officer@metroniq.local

Maintains strict isolation so new user signups start with empty dashboards.
"""

import uuid
import json
from datetime import datetime, timedelta, timezone
from app.core.database import SessionLocal
from app.models.user import User
from app.models.product import Product
from app.models.inspection import Inspection
from app.models.notice import ImprovementNotice
from app.models.reinspection import Reinspection
from app.models.enforcement import EnforcementCase
from app.models.manufacturer_workspace import (
    Submission, RectificationTask, ManufacturerDocument, ComplianceHistory
)
from app.models.audit import AuditLog

def seed_demo_data():
    db = SessionLocal()
    try:
        # 1. Fetch the 3 existing demo accounts
        mfg_user = db.query(User).filter(User.email == 'manufacturer@metroniq.local').first()
        off_user = db.query(User).filter(User.email == 'officer@metroniq.local').first()
        adm_user = db.query(User).filter(User.email == 'admin@metroniq.local').first()

        if not mfg_user or not off_user or not adm_user:
            print("ERROR: One or more demo accounts (admin, officer, manufacturer) not found!")
            return False

        print(f"Found Demo Users:\n  Admin: {adm_user.email} ({adm_user.id})\n  Officer: {off_user.email} ({off_user.id})\n  Manufacturer: {mfg_user.email} ({mfg_user.id})")

        now = datetime.now(timezone.utc)

        # ==========================================
        # 2. MANUFACTURER DEMO DATA (Fictional FMCG Products)
        # ==========================================
        demo_products_data = [
            {
                "name": "Pure Desi Cow Ghee 1L",
                "category": "Dairy / Food Packaging",
                "sku": "MFG-GHEE-001",
                "status": "APPROVED",
                "net_quantity": "1 L (905 g)",
                "mrp": "₹650.00 (incl. of all taxes)",
                "generic_name": "Clarified Butter",
                "manufacturer_name": "Metron Foods & Dairy Pvt Ltd, Industrial Area, Chennai",
                "country_of_origin": "India"
            },
            {
                "name": "Himalayan Organic Wild Honey 500g",
                "category": "Food Packaging",
                "sku": "MFG-HNY-002",
                "status": "UNDER_REVIEW",
                "net_quantity": "500 g",
                "mrp": "₹380.00 (incl. of all taxes)",
                "generic_name": "Natural Raw Honey",
                "manufacturer_name": "Metron Foods & Dairy Pvt Ltd, Industrial Area, Chennai",
                "country_of_origin": "India"
            },
            {
                "name": "Aromatic Basmati Rice Premium 5kg",
                "category": "Grain Packaging",
                "sku": "MFG-RCE-003",
                "status": "CHANGES_REQUIRED",
                "net_quantity": "5 kg",
                "mrp": "₹525.00 (incl. of all taxes)",
                "generic_name": "Basmati Rice",
                "manufacturer_name": "Metron Agro Processing Ltd, Chennai",
                "country_of_origin": "India"
            },
            {
                "name": "Cold Pressed Mustard Oil 1L",
                "category": "Edible Oils",
                "sku": "MFG-OIL-004",
                "status": "DRAFT",
                "net_quantity": "1 L",
                "mrp": "₹195.00 (incl. of all taxes)",
                "generic_name": "Kachi Ghani Mustard Oil",
                "manufacturer_name": "Metron Agro Processing Ltd, Chennai",
                "country_of_origin": "India"
            },
            {
                "name": "Roasted California Almonds 200g",
                "category": "Dry Fruits / Snack",
                "sku": "MFG-ALM-005",
                "status": "APPROVED",
                "net_quantity": "200 g",
                "mrp": "₹280.00 (incl. of all taxes)",
                "generic_name": "Almonds",
                "manufacturer_name": "Metron Foods & Dairy Pvt Ltd, Chennai",
                "country_of_origin": "India"
            }
        ]

        created_products = []
        for pdata in demo_products_data:
            existing = db.query(Product).filter(
                Product.owner_id == mfg_user.id,
                Product.sku == pdata["sku"]
            ).first()
            if not existing:
                prod = Product(
                    owner_id=mfg_user.id,
                    **pdata
                )
                db.add(prod)
                db.flush()
                created_products.append(prod)
                print(f"  + Added Product: {prod.name} ({prod.sku})")
            else:
                for k, v in pdata.items():
                    setattr(existing, k, v)
                created_products.append(existing)
                print(f"  * Updated Product: {existing.name} ({existing.sku})")

        # 3. Submissions for Manufacturer
        for p in created_products:
            if p.status in ["UNDER_REVIEW", "CHANGES_REQUIRED", "APPROVED"]:
                existing_sub = db.query(Submission).filter(
                    Submission.owner_id == mfg_user.id,
                    Submission.product_id == p.id
                ).first()
                if not existing_sub:
                    sub = Submission(
                        product_id=p.id,
                        owner_id=mfg_user.id,
                        status=p.status,
                        officer_comments="Mandatory declarations under PCR 2011 verified." if p.status == "APPROVED" else ("Font size of net quantity declaration does not conform to Rule 6." if p.status == "CHANGES_REQUIRED" else "Under regulatory review.")
                    )
                    db.add(sub)
                    print(f"  + Added Submission for: {p.name}")

        # 4. Rectification Tasks for Manufacturer
        rect_prod = next((p for p in created_products if p.sku == "MFG-RCE-003"), None)
        if rect_prod:
            existing_task = db.query(RectificationTask).filter(
                RectificationTask.owner_id == mfg_user.id,
                RectificationTask.product_id == rect_prod.id
            ).first()
            if not existing_task:
                task = RectificationTask(
                    owner_id=mfg_user.id,
                    product_id=rect_prod.id,
                    issue="Net Quantity font height below 4mm threshold required for 5kg package.",
                    required_action="Increase numeral height to minimum 4.0mm as mandated by Schedule II, Rule 7.",
                    status="PENDING",
                    due_date=now + timedelta(days=14)
                )
                db.add(task)
                print(f"  + Added Rectification Task for: {rect_prod.name}")

        # 5. Manufacturer Documents
        for p in created_products[:3]:
            existing_doc = db.query(ManufacturerDocument).filter(
                ManufacturerDocument.owner_id == mfg_user.id,
                ManufacturerDocument.product_id == p.id
            ).first()
            if not existing_doc:
                doc = ManufacturerDocument(
                    owner_id=mfg_user.id,
                    product_id=p.id,
                    title=f"Legal Metrology Declaration Certificate - {p.name}",
                    category="CERTIFICATE",
                    file_path=f"/uploads/docs/cert_{p.sku.lower()}.pdf"
                )
                db.add(doc)
                print(f"  + Added Document for: {p.name}")

        # 6. Manufacturer Compliance History
        history_events = [
            ("Product Created", f"Product '{created_products[0].name}' registered in workspace."),
            ("Audit Completed", f"Self-audit passed with 100% compliance for '{created_products[0].name}'."),
            ("Government Submission", f"Submitted '{created_products[1].name}' for pre-market verification."),
            ("Notice Received", f"Notice of correction issued for '{created_products[2].name}' (Font size issue)."),
            ("Product Approved", f"Government statutory verification approved for '{created_products[4].name}'.")
        ]
        for idx, (action, details) in enumerate(history_events):
            prod_target = created_products[idx % len(created_products)]
            existing_hist = db.query(ComplianceHistory).filter(
                ComplianceHistory.owner_id == mfg_user.id,
                ComplianceHistory.action == action,
                ComplianceHistory.product_id == prod_target.id
            ).first()
            if not existing_hist:
                hist = ComplianceHistory(
                    product_id=prod_target.id,
                    owner_id=mfg_user.id,
                    action=action,
                    details=details,
                    created_at=now - timedelta(days=5 - idx, hours=idx * 2)
                )
                db.add(hist)
                print(f"  + Added History Event: {action}")

        # ==========================================
        # 7. OFFICER DEMO DATA (Inspections, Notices, Reinspections, Enforcement)
        # ==========================================
        sample_evidence_payload = json.dumps({
            "legal_declarations": {
                "MRP": {"value": "₹650.00", "confidence": 0.96},
                "NET_QUANTITY": {"value": "1 L", "confidence": 0.94},
                "MANUFACTURER": {"value": "Metron Foods Pvt Ltd", "confidence": 0.91},
                "DATE": {"value": "08/2026", "confidence": 0.95},
                "CONSUMER_CARE": {"value": "care@metroniq.local", "confidence": 0.88}
            }
        })

        officer_inspections_data = [
            {
                "id": "INSP-DEMO-001",
                "product_id": created_products[0].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "LOW",
                "result": "PASS",
                "evidence_payload": sample_evidence_payload,
                "created_at": now - timedelta(hours=2)
            },
            {
                "id": "INSP-DEMO-002",
                "product_id": created_products[1].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "LOW",
                "result": "PASS",
                "evidence_payload": sample_evidence_payload,
                "created_at": now - timedelta(hours=5)
            },
            {
                "id": "INSP-DEMO-003",
                "product_id": created_products[2].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "HIGH",
                "result": "FAIL",
                "evidence_payload": sample_evidence_payload,
                "created_at": now - timedelta(days=1)
            },
            {
                "id": "INSP-DEMO-004",
                "product_id": created_products[3].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "MEDIUM",
                "result": "FAIL",
                "evidence_payload": sample_evidence_payload,
                "created_at": now - timedelta(days=2)
            },
            {
                "id": "INSP-DEMO-005",
                "product_id": created_products[4].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "LOW",
                "result": "PASS",
                "evidence_payload": sample_evidence_payload,
                "created_at": now - timedelta(days=3)
            }
        ]

        for idata in officer_inspections_data:
            existing_insp = db.query(Inspection).filter(Inspection.id == idata["id"]).first()
            if not existing_insp:
                insp = Inspection(**idata)
                db.add(insp)
                print(f"  + Added Officer Inspection: {idata['id']}")
            else:
                for k, v in idata.items():
                    setattr(existing_insp, k, v)
                print(f"  * Updated Officer Inspection: {idata['id']}")

        # 8. Improvement Notice linked to Failed Inspection
        existing_notice = db.query(ImprovementNotice).filter(
            ImprovementNotice.inspection_id == "INSP-DEMO-003"
        ).first()
        if not existing_notice:
            notice = ImprovementNotice(
                inspection_id="INSP-DEMO-003",
                manufacturer_id=mfg_user.id,
                status="ISSUED",
                violations=json.dumps(["NET_QUANTITY_FONT_SIZE", "CONSUMER_CARE_CONTACT_INCOMPLETE"]),
                due_date=now + timedelta(days=14)
            )
            db.add(notice)
            db.flush()
            print(f"  + Added Improvement Notice for: INSP-DEMO-003")
        else:
            notice = existing_notice

        # 9. Reinspection Scheduled for Notice
        existing_reinsp = db.query(Reinspection).filter(
            Reinspection.original_inspection_id == "INSP-DEMO-003"
        ).first()
        if not existing_reinsp:
            reinsp = Reinspection(
                original_inspection_id="INSP-DEMO-003",
                notice_id=notice.id,
                assigned_officer_id=off_user.id,
                status="SCHEDULED",
                scheduled_date=now + timedelta(days=7)
            )
            db.add(reinsp)
            db.flush()
            print(f"  + Added Reinspection for: INSP-DEMO-003")
        else:
            reinsp = existing_reinsp

        # 10. Enforcement Case for High Risk Case
        existing_enf = db.query(EnforcementCase).filter(
            EnforcementCase.original_inspection_id == "INSP-DEMO-003"
        ).first()
        if not existing_enf:
            enf = EnforcementCase(
                reinspection_id=reinsp.id,
                original_inspection_id="INSP-DEMO-003",
                manufacturer_id=mfg_user.id,
                assigned_officer_id=off_user.id,
                status="PENALTY_PENDING",
                penalty_amount=25000.0
            )
            db.add(enf)
            print(f"  + Added Enforcement Case for: INSP-DEMO-003")

        # ==========================================
        # 11. ADMIN AUDIT LOGS (System-wide timeline)
        # ==========================================
        audit_events = [
            ("RULE_ACTIVATED", "RULE_VERSION", "PCR-2011-R06", adm_user.id, now - timedelta(days=10)),
            ("RULE_ACTIVATED", "RULE_VERSION", "PCR-2011-R07", adm_user.id, now - timedelta(days=9)),
            ("INSPECTION_COMPLETED", "INSPECTION", "INSP-DEMO-001", off_user.id, now - timedelta(hours=2)),
            ("INSPECTION_COMPLETED", "INSPECTION", "INSP-DEMO-003", off_user.id, now - timedelta(days=1)),
            ("IMPROVEMENT_NOTICE_ISSUED", "NOTICE", str(notice.id)[:8], off_user.id, now - timedelta(days=1)),
            ("REINSPECTION_SCHEDULED", "REINSPECTION", str(reinsp.id)[:8], off_user.id, now - timedelta(hours=18)),
            ("ENFORCEMENT_INITIATED", "ENFORCEMENT_CASE", "ENF-PCR-003", off_user.id, now - timedelta(hours=12))
        ]

        for action, entity, entity_id, user_id, timestamp in audit_events:
            existing_log = db.query(AuditLog).filter(
                AuditLog.action == action,
                AuditLog.entity_id == entity_id
            ).first()
            if not existing_log:
                log = AuditLog(
                    user_id=user_id,
                    action=action,
                    entity=entity,
                    entity_id=entity_id,
                    created_at=timestamp
                )
                db.add(log)
                print(f"  + Added Audit Log: {action} ({entity_id})")

        db.commit()
        print("\nSUCCESS: All demo data successfully seeded and committed for the 3 demo accounts!")
        return True

    except Exception as e:
        db.rollback()
        print(f"ERROR while seeding demo data: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_data()
