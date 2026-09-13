from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserOut

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
        
    requested_role = user_in.role.upper() if hasattr(user_in, 'role') else "MANUFACTURER"
    if requested_role == "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Cannot register as an Admin user.",
        )
    
    user_status = "APPROVED"
    if requested_role == "OFFICER":
        user_status = "PENDING_APPROVAL"
    else:
        requested_role = "MANUFACTURER" # Enforce default
        
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=requested_role,
        status=user_status,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    if getattr(user, "status", "APPROVED") == "PENDING_APPROVAL":
        raise HTTPException(status_code=403, detail="Admin approval is required before logging in.")
    elif getattr(user, "status", "APPROVED") == "REJECTED":
        raise HTTPException(status_code=403, detail="Your account registration was rejected.")
    elif getattr(user, "status", "APPROVED") == "SUSPENDED":
        raise HTTPException(status_code=403, detail="Your account has been suspended.")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES) if hasattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES") else timedelta(minutes=60)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}
