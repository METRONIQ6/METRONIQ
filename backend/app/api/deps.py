from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import uuid
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_uuid).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions: Admin required")
    return current_user

def get_current_officer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["OFFICER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not enough permissions: Officer required")
    return current_user

def get_current_manufacturer(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["MANUFACTURER", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not enough permissions: Manufacturer required")
    return current_user