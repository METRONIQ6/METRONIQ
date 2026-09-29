"""Reset officer and admin passwords for testing."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash, verify_password

db = SessionLocal()

TEST_CREDS = [
    ("admin@metroniq.local", "admin_pass"),
    ("officer@metroniq.local", "officer_pass"),
]

# First try to detect existing passwords
common_passwords = ["password123", "metroniq123", "admin123", "officer123", "MetronIQ2024!", "test123", "123456"]

for email, _ in TEST_CREDS:
    user = db.query(User).filter(User.email == email).first()
    if user:
        for pw in common_passwords:
            if verify_password(pw, user.hashed_password):
                print(f"FOUND: {email} => {pw}")
                break
        else:
            print(f"UNKNOWN password for {email}")
    else:
        print(f"User not found: {email}")

db.close()
