"""
Admin authentication — JWT login.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import verify_password, create_access_token, get_current_admin
from app import models, schemas

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.AdminUser).filter(models.AdminUser.email == payload.email).first()
    if not admin or not verify_password(payload.password, admin.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    if not admin.is_active:
        raise HTTPException(403, "Account disabled")
    token = create_access_token({"sub": admin.email})
    return schemas.Token(access_token=token)


@router.get("/me", response_model=schemas.AdminOut)
def me(current_admin: models.AdminUser = Depends(get_current_admin)):
    return current_admin
