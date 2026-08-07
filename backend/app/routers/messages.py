from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_admin
from app import models, schemas

router = APIRouter(prefix="/api/messages", tags=["Messages"])


@router.post("", response_model=schemas.ContactMessageOut)
def create_message(payload: schemas.ContactMessageIn, db: Session = Depends(get_db)):
    message = models.ContactMessage(name=payload.name, email=payload.email, message=payload.message)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("", response_model=List[schemas.ContactMessageOut], dependencies=[Depends(get_current_admin)])
def list_messages(db: Session = Depends(get_db)):
    return db.query(models.ContactMessage).order_by(models.ContactMessage.created_at.desc()).all()
