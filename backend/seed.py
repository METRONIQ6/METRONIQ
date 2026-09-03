import os
import uuid
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.product import Manufacturer, Product
from app.models.rule import Rule, RuleVersion

def seed_database():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(Rule).first():
            print("Database already seeded. Skipping.")
            return

        print("Seeding Rules...")
        r1 = Rule(id="RULE-001", name="Mandatory Declarations on Packaged Commodities", category="PACKAGING")
        v1 = RuleVersion(rule_id="RULE-001", version_number=1, status="ACTIVE", logic_payload={"field": "net_quantity", "required": True})
        
        r2 = Rule(id="RULE-002", name="Principal Display Panel Area Calculation", category="DISPLAY")
        v2 = RuleVersion(rule_id="RULE-002", version_number=1, status="ACTIVE", logic_payload={"area_min_percentage": 40})
        
        r3 = Rule(id="RULE-003", name="Standard Quantities for Specified Disposables", category="PACKAGING")
        v3 = RuleVersion(rule_id="RULE-003", version_number=1, status="DRAFT", logic_payload={})

        db.add_all([r1, v1, r2, v2, r3, v3])

        print("Seeding Manufacturers and Products...")
        m1 = Manufacturer(id=uuid.uuid4(), name="AquaCorp India", location="Mumbai, MH")
        m2 = Manufacturer(id=uuid.uuid4(), name="SnackFoods Ltd", location="Delhi, DL")
        db.add_all([m1, m2])
        db.commit() # Commit to get IDs
        
        p1 = Product(id=uuid.uuid4(), name="AquaCorp 1L Packaged Water", category="BEVERAGE", manufacturer_id=m1.id)
        p2 = Product(id=uuid.uuid4(), name="Snacks Crisps 100g", category="FOOD", manufacturer_id=m2.id)
        db.add_all([p1, p2])
        
        db.commit()
        print("Database seeding completed securely!")
    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()