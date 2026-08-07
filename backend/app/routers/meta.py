"""
Lookup endpoints for categories/colors/sizes, used to build filters and admin forms.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_admin
from app import models, schemas

router = APIRouter(prefix="/api/meta", tags=["Meta"])


@router.get("/categories", response_model=List[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@router.get("/colors", response_model=List[schemas.ColorOut])
def list_colors(db: Session = Depends(get_db)):
    return db.query(models.Color).all()


@router.get("/sizes", response_model=List[schemas.SizeOut])
def list_sizes(db: Session = Depends(get_db)):
    return db.query(models.Size).order_by(models.Size.sort_order).all()


@router.post("/categories", response_model=schemas.CategoryOut, dependencies=[Depends(get_current_admin)])
def create_category(payload: schemas.CategoryBase, db: Session = Depends(get_db)):
    cat = models.Category(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.post("/colors", response_model=schemas.ColorOut, dependencies=[Depends(get_current_admin)])
def create_color(payload: schemas.ColorBase, db: Session = Depends(get_db)):
    color = models.Color(**payload.model_dump())
    db.add(color)
    db.commit()
    db.refresh(color)
    return color


@router.post("/sizes", response_model=schemas.SizeOut, dependencies=[Depends(get_current_admin)])
def create_size(payload: schemas.SizeBase, db: Session = Depends(get_db)):
    size = models.Size(**payload.model_dump())
    db.add(size)
    db.commit()
    db.refresh(size)
    return size
