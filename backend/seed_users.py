import os
import sys
import uuid
import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, Base, engine
from app.models.user import User
from app.core.security import get_password_hash

# Ensure models are created
Base.metadata.create_all(bind=engine)

db = SessionLocal()

def create_user_if_missing(email, role):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            id=uuid.uuid4(),
            email=email,
            hashed_password=get_password_hash("password123"),
            role=role,
            is_active=True
        )
        db.add(user)
        print(f"Created {role} user: {email} / password123")
    else:
        print(f"User {email} already exists")

create_user_if_missing("admin@metroniq.local", "ADMIN")
create_user_if_missing("officer@metroniq.local", "OFFICER")
create_user_if_missing("manufacturer@metroniq.local", "MANUFACTURER")

db.commit()
db.close()
