import os
import sys
import uuid
import random
import json
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models.inspection import Inspection
from app.models.product import Product

def create_demo_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        product = db.query(Product).first()
        product_id = product.id if product else None
        
        print("Generating mock demo inspections...")
        
        num_days = 7
        total_created = 0
        
        common_fields = ["mrp", "net_quantity", "manufacturer", "manufacture_date", "expiry_date", "customer_care"]
        
        for day in range(num_days, -1, -1):
            date = datetime.utcnow() - timedelta(days=day)
            num_inspections = random.randint(15, 35) # random inspections per day
            
            for _ in range(num_inspections):
                status_choices = ["COMPLETED"] * 80 + ["FAILED"] * 5 + ["PROCESSING"] * 5 + ["PENDING"] * 10
                current_status = random.choice(status_choices)
                
                result = "PENDING_RULES" if current_status == "COMPLETED" and random.random() < 0.2 else random.choice(["COMPLIANT", "NON_COMPLIANT", "PENDING_RULES"])
                
                evidence_payload = None
                if current_status == "COMPLETED":
                    declarations = {}
                    num_fields = random.randint(2, len(common_fields))
                    fields = random.sample(common_fields, num_fields)
                    
                    for f in fields:
                        declarations[f] = {
                            "value": f"mock_{f}",
                            "confidence": round(random.uniform(0.65, 0.99), 2),
                            "box": [0,0,10,10]
                        }
                    
                    evidence_payload = json.dumps({
                        "legal_declarations": declarations,
                        "metadata": {"source": "demo_data_script"}
                    })
                
                # Jitter time over the day
                jitter_date = date.replace(hour=random.randint(8, 18), minute=random.randint(0, 59))

                inspection = Inspection(
                    id=str(uuid.uuid4()),
                    product_id=product_id,
                    status=current_status,
                    result=result,
                    evidence_payload=evidence_payload,
                    created_at=jitter_date,
                    updated_at=jitter_date
                )
                db.add(inspection)
                total_created += 1
                
        db.commit()
        print(f"Successfully inserted {total_created} demo inspections.")
    except Exception as e:
        print(f"Failed to add demo data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    create_demo_data()
