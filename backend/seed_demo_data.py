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
from app.models.product import Product, Manufacturer
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
        # 2. MANUFACTURERS (Geographical Registry Entities)
        # ==========================================
        demo_manufacturers_data = [
            {"name": "Metron Foods & Dairy Pvt Ltd", "location": "Chennai, Tamil Nadu"},
            {"name": "Himalayan Organics India Ltd", "location": "Dehradun, Uttarakhand"},
            {"name": "Northern Grain Mills Ltd", "location": "Ludhiana, Punjab"},
            {"name": "Vedic Agro Processing Pvt Ltd", "location": "Pune, Maharashtra"},
            {"name": "Bengal Spices & Staples Co", "location": "Kolkata, West Bengal"},
            {"name": "Telangana Packaged Commodities Ltd", "location": "Hyderabad, Telangana"},
            {"name": "Deccan Consumer Goods Ltd", "location": "Bengaluru, Karnataka"}
        ]

        created_manufacturers = {}
        for mdata in demo_manufacturers_data:
            existing_mfg = db.query(Manufacturer).filter(Manufacturer.name == mdata["name"]).first()
            if not existing_mfg:
                mfg_entity = Manufacturer(**mdata)
                db.add(mfg_entity)
                db.flush()
                created_manufacturers[mdata["name"]] = mfg_entity
                print(f"  + Added Manufacturer Entity: {mdata['name']} ({mdata['location']})")
            else:
                existing_mfg.location = mdata["location"]
                created_manufacturers[mdata["name"]] = existing_mfg
                print(f"  * Updated Manufacturer Entity: {existing_mfg.name} ({existing_mfg.location})")

        # ==========================================
        # 3. MANUFACTURER DEMO PRODUCTS (Fictional FMCG Packages)
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
                "manufacturer_name": "Metron Foods & Dairy Pvt Ltd, Guindy Industrial Area, Chennai, Tamil Nadu - 600032",
                "country_of_origin": "India",
                "manufacturer_id": created_manufacturers["Metron Foods & Dairy Pvt Ltd"].id
            },
            {
                "name": "Himalayan Organic Wild Honey 500g",
                "category": "Food Packaging",
                "sku": "MFG-HNY-002",
                "status": "UNDER_REVIEW",
                "net_quantity": "500 g",
                "mrp": "₹380.00 (incl. of all taxes)",
                "generic_name": "Natural Raw Honey",
                "manufacturer_name": "Himalayan Organics India Ltd, Dehradun, Uttarakhand - 248001",
                "country_of_origin": "India",
                "manufacturer_id": created_manufacturers["Himalayan Organics India Ltd"].id
            },
            {
                "name": "Aromatic Basmati Rice Premium 5kg",
                "category": "Grain Packaging",
                "sku": "MFG-RCE-003",
                "status": "CHANGES_REQUIRED",
                "net_quantity": "5 kg",
                "mrp": "₹525.00 (incl. of all taxes)",
                "generic_name": "Basmati Rice",
                "manufacturer_name": "Northern Grain Mills Ltd, Ludhiana, Punjab - 141001",
                "country_of_origin": "India",
                "manufacturer_id": created_manufacturers["Northern Grain Mills Ltd"].id
            },
            {
                "name": "Cold Pressed Mustard Oil 1L",
                "category": "Edible Oils",
                "sku": "MFG-OIL-004",
                "status": "DRAFT",
                "net_quantity": "1 L",
                "mrp": "₹195.00 (incl. of all taxes)",
                "generic_name": "Kachi Ghani Mustard Oil",
                "manufacturer_name": "Vedic Agro Processing Pvt Ltd, Pune, Maharashtra - 411001",
                "country_of_origin": "India",
                "manufacturer_id": created_manufacturers["Vedic Agro Processing Pvt Ltd"].id
            },
            {
                "name": "Roasted California Almonds 200g",
                "category": "Dry Fruits / Snacks",
                "sku": "MFG-ALM-005",
                "status": "APPROVED",
                "net_quantity": "200 g",
                "mrp": "₹280.00 (incl. of all taxes)",
                "generic_name": "Almonds",
                "manufacturer_name": "Metron Foods & Dairy Pvt Ltd, Chennai, Tamil Nadu - 600032",
                "country_of_origin": "India",
                "manufacturer_id": created_manufacturers["Metron Foods & Dairy Pvt Ltd"].id
            },
            {
                "name": "Assam Premium CTC Black Tea 500g",
                "category": "Beverages",
                "sku": "MFG-TEA-006",
                "status": "APPROVED",
                "net_quantity": "500 g",
                "mrp": "₹240.00 (incl. of all taxes)",
                "generic_name": "Black Tea",
                "manufacturer_name": "Bengal Spices & Staples Co, Kolkata, West Bengal - 700001",
                "country_of_origin": "India",
                "manufacturer_id": created_manufacturers["Bengal Spices & Staples Co"].id
            },
            {
                "name": "Organic Turmeric Powder 250g",
                "category": "Spices / Condiments",
                "sku": "MFG-SPC-007",
                "status": "UNDER_REVIEW",
                "net_quantity": "250 g",
                "mrp": "₹110.00 (incl. of all taxes)",
                "generic_name": "Turmeric Powder",
                "manufacturer_name": "Telangana Packaged Commodities Ltd, Hyderabad, Telangana - 500001",
                "country_of_origin": "India",
                "manufacturer_id": created_manufacturers["Telangana Packaged Commodities Ltd"].id
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

        # ==========================================
        # 4. SUBMISSIONS FOR MANUFACTURER
        # ==========================================
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
                        officer_comments="Mandatory declarations under PCR 2011 verified." if p.status == "APPROVED" else ("Font size of net quantity declaration does not conform to Rule 6." if p.status == "CHANGES_REQUIRED" else "Under regulatory review by statutory officer.")
                    )
                    db.add(sub)
                    print(f"  + Added Submission for: {p.name}")

        # ==========================================
        # 5. RECTIFICATION TASKS FOR MANUFACTURER
        # ==========================================
        rect_prod_1 = next((p for p in created_products if p.sku == "MFG-RCE-003"), None)
        if rect_prod_1:
            existing_task_1 = db.query(RectificationTask).filter(
                RectificationTask.owner_id == mfg_user.id,
                RectificationTask.product_id == rect_prod_1.id
            ).first()
            if not existing_task_1:
                task1 = RectificationTask(
                    owner_id=mfg_user.id,
                    product_id=rect_prod_1.id,
                    issue="Net Quantity font height below 4mm threshold required for 5kg package.",
                    required_action="Increase numeral height to minimum 4.0mm as mandated by Schedule II, Rule 7.",
                    status="PENDING",
                    due_date=now + timedelta(days=14)
                )
                db.add(task1)
                print(f"  + Added Rectification Task for: {rect_prod_1.name}")

        rect_prod_2 = next((p for p in created_products if p.sku == "MFG-SPC-007"), None)
        if rect_prod_2:
            existing_task_2 = db.query(RectificationTask).filter(
                RectificationTask.owner_id == mfg_user.id,
                RectificationTask.product_id == rect_prod_2.id
            ).first()
            if not existing_task_2:
                task2 = RectificationTask(
                    owner_id=mfg_user.id,
                    product_id=rect_prod_2.id,
                    issue="Batch number and manufacturing date clarity required enhancement.",
                    required_action="Updated high-contrast printing applied to top flap.",
                    status="RESOLVED",
                    due_date=now - timedelta(days=2)
                )
                db.add(task2)
                print(f"  + Added Rectification Task for: {rect_prod_2.name}")

        # ==========================================
        # 6. MANUFACTURER DOCUMENTS
        # ==========================================
        doc_definitions = [
            ("Legal Metrology Declaration Certificate - Ghee 1L", "CERTIFICATE", created_products[0].id, "cert_ghee_001.pdf"),
            ("Pre-Market Legal Metrology Declaration - Honey 500g", "DECLARATION", created_products[1].id, "decl_honey_002.pdf"),
            ("Label Typography & PDP Verification Sheet - Rice 5kg", "LABEL_ARTWORK", created_products[2].id, "label_rice_003.pdf"),
            ("Schedule II Net Quantity Test Report - Mustard Oil 1L", "TEST_REPORT", created_products[3].id, "test_oil_004.pdf"),
            ("Importer Statutory Certificate - Almonds 200g", "CERTIFICATE", created_products[4].id, "cert_almond_005.pdf"),
            ("Commodity Compliance Dossier - Tea 500g", "DOSSIER", created_products[5].id, "dossier_tea_006.pdf")
        ]
        for title, category, pid, fname in doc_definitions:
            existing_doc = db.query(ManufacturerDocument).filter(
                ManufacturerDocument.owner_id == mfg_user.id,
                ManufacturerDocument.title == title
            ).first()
            if not existing_doc:
                doc = ManufacturerDocument(
                    owner_id=mfg_user.id,
                    product_id=pid,
                    title=title,
                    category=category,
                    file_path=f"/uploads/docs/{fname}"
                )
                db.add(doc)
                print(f"  + Added Document: {title}")

        # ==========================================
        # 7. MANUFACTURER COMPLIANCE HISTORY
        # ==========================================
        history_events = [
            ("Product Created", f"Product '{created_products[0].name}' registered in workspace.", now - timedelta(days=6)),
            ("Audit Completed", f"Self-audit passed with 100% compliance for '{created_products[0].name}'.", now - timedelta(days=5, hours=18)),
            ("Government Submission", f"Submitted '{created_products[1].name}' for pre-market verification.", now - timedelta(days=4, hours=12)),
            ("Notice Received", f"Notice of correction issued for '{created_products[2].name}' (Font size issue).", now - timedelta(days=3, hours=8)),
            ("Product Approved", f"Government statutory verification approved for '{created_products[4].name}'.", now - timedelta(days=2, hours=14)),
            ("Product Created", f"Product '{created_products[5].name}' registered in workspace.", now - timedelta(days=2, hours=4)),
            ("Audit Completed", f"Statutory pre-market verification approved for '{created_products[5].name}'.", now - timedelta(days=1, hours=10)),
            ("Government Submission", f"Submitted '{created_products[6].name}' for regulatory review.", now - timedelta(hours=6))
        ]
        for action, details, timestamp in history_events:
            existing_hist = db.query(ComplianceHistory).filter(
                ComplianceHistory.owner_id == mfg_user.id,
                ComplianceHistory.action == action,
                ComplianceHistory.details == details
            ).first()
            if not existing_hist:
                hist = ComplianceHistory(
                    product_id=created_products[0].id,
                    owner_id=mfg_user.id,
                    action=action,
                    details=details,
                    created_at=timestamp
                )
                db.add(hist)
                print(f"  + Added History Event: {action}")

        # ==========================================
        # 8. OFFICER DEMO INSPECTIONS (Time-series distributed across last 7 days)
        # ==========================================
        def make_evidence_payload(name, mfg, net_qty, mrp, date_str, compliant=True, risk="LOW"):
            return json.dumps({
                "legal_declarations": {
                    "PRODUCT_NAME": {"value": name, "confidence": 0.95},
                    "MANUFACTURER": {"value": mfg, "confidence": 0.93},
                    "NET_QUANTITY": {"value": net_qty, "confidence": 0.96},
                    "MRP": {"value": mrp, "confidence": 0.97},
                    "DATE": {"value": date_str, "confidence": 0.92},
                    "CONSUMER_CARE": {"value": "care@metroniq.local", "confidence": 0.90},
                    "COUNTRY_OF_ORIGIN": {"value": "India", "confidence": 0.98}
                },
                "validation": {
                    "compliance": "COMPLIANT" if compliant else "NON_COMPLIANT",
                    "risk_score": risk,
                    "evaluations": [
                        {"rule_id": "LM-PCR-R06", "name": "Net Quantity Declaration", "status": "PASS" if compliant else "FAIL", "mandatory": True},
                        {"rule_id": "LM-PCR-R07", "name": "MRP Declaration & Inclusion of Taxes", "status": "PASS", "mandatory": True},
                        {"rule_id": "LM-PCR-R08", "name": "Manufacturer Name and Address", "status": "PASS", "mandatory": True},
                        {"rule_id": "LM-PCR-R09", "name": "Month and Year of Packaging", "status": "PASS", "mandatory": True},
                        {"rule_id": "LM-PCR-R10", "name": "Consumer Care Details", "status": "PASS", "mandatory": True}
                    ]
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
                "evidence_payload": make_evidence_payload("Pure Desi Cow Ghee 1L", "Metron Foods & Dairy Pvt Ltd", "1 L", "₹650.00", "08/2026", True, "LOW"),
                "created_at": now - timedelta(hours=2)
            },
            {
                "id": "INSP-DEMO-002",
                "product_id": created_products[1].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "LOW",
                "result": "PASS",
                "evidence_payload": make_evidence_payload("Himalayan Organic Wild Honey 500g", "Himalayan Organics India Ltd", "500 g", "₹380.00", "07/2026", True, "LOW"),
                "created_at": now - timedelta(hours=4)
            },
            {
                "id": "INSP-DEMO-003",
                "product_id": created_products[2].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "HIGH",
                "result": "FAIL",
                "evidence_payload": make_evidence_payload("Aromatic Basmati Rice Premium 5kg", "Northern Grain Mills Ltd", "5 kg", "₹525.00", "08/2026", False, "HIGH"),
                "created_at": now - timedelta(days=1, hours=3)
            },
            {
                "id": "INSP-DEMO-004",
                "product_id": created_products[3].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "MEDIUM",
                "result": "FAIL",
                "evidence_payload": make_evidence_payload("Cold Pressed Mustard Oil 1L", "Vedic Agro Processing Pvt Ltd", "1 L", "₹195.00", "08/2026", False, "MEDIUM"),
                "created_at": now - timedelta(days=2, hours=5)
            },
            {
                "id": "INSP-DEMO-005",
                "product_id": created_products[4].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "LOW",
                "result": "PASS",
                "evidence_payload": make_evidence_payload("Roasted California Almonds 200g", "Metron Foods & Dairy Pvt Ltd", "200 g", "₹280.00", "09/2026", True, "LOW"),
                "created_at": now - timedelta(days=3, hours=2)
            },
            {
                "id": "INSP-DEMO-006",
                "product_id": created_products[5].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "LOW",
                "result": "PASS",
                "evidence_payload": make_evidence_payload("Assam Premium CTC Black Tea 500g", "Bengal Spices & Staples Co", "500 g", "₹240.00", "08/2026", True, "LOW"),
                "created_at": now - timedelta(days=4, hours=4)
            },
            {
                "id": "INSP-DEMO-007",
                "product_id": created_products[6].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "MEDIUM",
                "result": "FAIL",
                "evidence_payload": make_evidence_payload("Organic Turmeric Powder 250g", "Telangana Packaged Commodities Ltd", "250 g", "₹110.00", "08/2026", False, "MEDIUM"),
                "created_at": now - timedelta(days=5, hours=6)
            },
            {
                "id": "INSP-DEMO-008",
                "product_id": created_products[0].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "LOW",
                "result": "PASS",
                "evidence_payload": make_evidence_payload("Pure Desi Cow Ghee 500ml", "Metron Foods & Dairy Pvt Ltd", "500 ml", "₹340.00", "08/2026", True, "LOW"),
                "created_at": now - timedelta(days=6, hours=1)
            },
            {
                "id": "INSP-DEMO-009",
                "product_id": created_products[1].id,
                "officer_id": off_user.id,
                "status": "COMPLETED",
                "risk_level": "HIGH",
                "result": "FAIL",
                "evidence_payload": make_evidence_payload("Organic Clover Honey 1kg", "Himalayan Organics India Ltd", "1 kg", "₹720.00", "06/2026", False, "HIGH"),
                "created_at": now - timedelta(days=6, hours=8)
            },
            {
                "id": "INSP-DEMO-010",
                "product_id": created_products[4].id,
                "officer_id": off_user.id,
                "status": "PROCESSING",
                "risk_level": "LOW",
                "result": "PENDING_RULES",
                "evidence_payload": make_evidence_payload("Salted Cashews 200g", "Metron Foods & Dairy Pvt Ltd", "200 g", "₹310.00", "09/2026", True, "LOW"),
                "created_at": now - timedelta(minutes=45)
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

        # ==========================================
        # 9. IMPROVEMENT NOTICES (Linked to Failed Inspections)
        # ==========================================
        notice_definitions = [
            ("INSP-DEMO-003", "ISSUED", ["NET_QUANTITY_FONT_SIZE", "CONSUMER_CARE_CONTACT_INCOMPLETE"], 14),
            ("INSP-DEMO-004", "RECTIFICATION_SUBMITTED", ["MANUFACTURING_DATE_FORMAT_NON_CONFORMING"], 10),
            ("INSP-DEMO-007", "ISSUED", ["MAXIMUM_RETAIL_PRICE_TAX_INCLUSION_MISSING"], 12)
        ]

        created_notices = {}
        for insp_id, status, violations, due_days in notice_definitions:
            existing_notice = db.query(ImprovementNotice).filter(
                ImprovementNotice.inspection_id == insp_id
            ).first()
            if not existing_notice:
                notice = ImprovementNotice(
                    inspection_id=insp_id,
                    manufacturer_id=mfg_user.id,
                    status=status,
                    violations=json.dumps(violations),
                    due_date=now + timedelta(days=due_days)
                )
                db.add(notice)
                db.flush()
                created_notices[insp_id] = notice
                print(f"  + Added Improvement Notice for: {insp_id} ({status})")
            else:
                existing_notice.status = status
                existing_notice.violations = json.dumps(violations)
                created_notices[insp_id] = existing_notice
                print(f"  * Updated Improvement Notice for: {insp_id} ({status})")

        # ==========================================
        # 10. REINSPECTIONS (Scheduled for Notices)
        # ==========================================
        reinspection_definitions = [
            ("INSP-DEMO-003", created_notices["INSP-DEMO-003"].id, "SCHEDULED", 5),
            ("INSP-DEMO-004", created_notices["INSP-DEMO-004"].id, "SCHEDULED", 8)
        ]

        created_reinspections = {}
        for orig_id, notice_id, status, sched_days in reinspection_definitions:
            existing_reinsp = db.query(Reinspection).filter(
                Reinspection.original_inspection_id == orig_id
            ).first()
            if not existing_reinsp:
                reinsp = Reinspection(
                    original_inspection_id=orig_id,
                    notice_id=notice_id,
                    assigned_officer_id=off_user.id,
                    status=status,
                    scheduled_date=now + timedelta(days=sched_days)
                )
                db.add(reinsp)
                db.flush()
                created_reinspections[orig_id] = reinsp
                print(f"  + Added Reinspection for: {orig_id} ({status})")
            else:
                existing_reinsp.status = status
                existing_reinsp.scheduled_date = now + timedelta(days=sched_days)
                created_reinspections[orig_id] = existing_reinsp
                print(f"  * Updated Reinspection for: {orig_id} ({status})")

        # ==========================================
        # 11. ENFORCEMENT CASES
        # ==========================================
        enforcement_definitions = [
            ("INSP-DEMO-003", created_reinspections["INSP-DEMO-003"].id, "PENALTY_PENDING", 25000.0),
            ("INSP-DEMO-004", created_reinspections["INSP-DEMO-004"].id, "UNDER_REVIEW", 10000.0)
        ]

        for orig_id, reinsp_id, status, penalty in enforcement_definitions:
            existing_enf = db.query(EnforcementCase).filter(
                EnforcementCase.original_inspection_id == orig_id
            ).first()
            if not existing_enf:
                enf = EnforcementCase(
                    reinspection_id=reinsp_id,
                    original_inspection_id=orig_id,
                    manufacturer_id=mfg_user.id,
                    assigned_officer_id=off_user.id,
                    status=status,
                    penalty_amount=penalty
                )
                db.add(enf)
                print(f"  + Added Enforcement Case for: {orig_id} ({status})")
            else:
                existing_enf.status = status
                existing_enf.penalty_amount = penalty
                print(f"  * Updated Enforcement Case for: {orig_id} ({status})")

        # ==========================================
        # 12. AUDIT LOGS (System-wide timeline for Officer & Admin Activity)
        # ==========================================
        audit_events = [
            ("RULE_ACTIVATED", "RULE_VERSION", "PCR-2011-R06", adm_user.id, now - timedelta(days=10)),
            ("RULE_ACTIVATED", "RULE_VERSION", "PCR-2011-R07", adm_user.id, now - timedelta(days=9)),
            ("INSPECTION_COMPLETED", "INSPECTION", "INSP-DEMO-001", off_user.id, now - timedelta(hours=2)),
            ("INSPECTION_COMPLETED", "INSPECTION", "INSP-DEMO-002", off_user.id, now - timedelta(hours=4)),
            ("INSPECTION_COMPLETED", "INSPECTION", "INSP-DEMO-003", off_user.id, now - timedelta(days=1, hours=3)),
            ("IMPROVEMENT_NOTICE_ISSUED", "NOTICE", str(created_notices['INSP-DEMO-003'].id)[:8], off_user.id, now - timedelta(days=1, hours=2)),
            ("REINSPECTION_SCHEDULED", "REINSPECTION", str(created_reinspections['INSP-DEMO-003'].id)[:8], off_user.id, now - timedelta(hours=18)),
            ("ENFORCEMENT_INITIATED", "ENFORCEMENT_CASE", "INSP-DEMO-003", off_user.id, now - timedelta(hours=12)),
            ("INSPECTION_COMPLETED", "INSPECTION", "INSP-DEMO-006", off_user.id, now - timedelta(days=4, hours=4)),
            ("PRODUCT_APPROVED", "PRODUCT", str(created_products[0].id)[:8], off_user.id, now - timedelta(days=5))
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
