import os
import re

# 1. Add .dockerignore
dockerignore_path = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend\.dockerignore"
dockerignore_content = """
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
pip-log.txt
pip-delete-this-directory.txt
.env
.pytest_cache/
alembic/versions/*
"""
with open(dockerignore_path, "w") as f:
    f.write(dockerignore_content.strip())
print("Added .dockerignore")

# 2. Fix CORS in main.py
main_py_path = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend\app\main.py"
with open(main_py_path, "r") as f:
    main_content = f.read()

main_content = main_content.replace('allow_origins=["*"], # Should limit in real env', 'allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],')
with open(main_py_path, "w") as f:
    f.write(main_content)
print("Restricted CORS in main.py")

# 3. Create Seed Script with SQLite Fallback in config.py
config_path = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend\app\core\config.py"
with open(config_path, "r") as f:
    config_content = f.read()

config_content = config_content.replace(
    'DATABASE_URL: str = "postgresql://postgres:postgrespassword@localhost:5432/metroniq"',
    'DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./metroniq-dev.db")'
)
if "import os" not in config_content:
    config_content = "import os\n" + config_content

with open(config_path, "w") as f:
    f.write(config_content)
print("Updated config.py for SQLite fallback")

# Write seed.py
seed_py_path = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\backend\seed.py"
seed_content = """
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
"""
with open(seed_py_path, "w") as f:
    f.write(seed_content.strip())
print("Created seed.py DB seed utility")
