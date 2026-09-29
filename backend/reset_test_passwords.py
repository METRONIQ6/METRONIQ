"""Reset officer and admin passwords for benchmark testing."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()

TEST_PASSWORD = "MetronIQ_Test123"

for email in ["admin@metroniq.local", "officer@metroniq.local"]:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.hashed_password = get_password_hash(TEST_PASSWORD)
        user.is_active = True
        if hasattr(user, 'status'):
            user.status = "APPROVED"
        print(f"Reset password for {email} => {TEST_PASSWORD}")
    else:
        print(f"User not found: {email}")

db.commit()
db.close()
print("Done.")
