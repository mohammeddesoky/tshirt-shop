"""
Customers API — admin-only listing with aggregated order stats.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.auth import get_current_admin
from app import models, schemas

router = APIRouter(prefix="/api/customers", tags=["Customers"], dependencies=[Depends(get_current_admin)])


@router.get("", response_model=List[schemas.CustomerAdminOut])
def list_customers(db: Session = Depends(get_db)):
    customers = db.query(models.Customer).options(joinedload(models.Customer.orders)).all()
    return [
        schemas.CustomerAdminOut(
            id=c.id, name=c.name, phone=c.phone, email=c.email,
            total_orders=c.total_orders, total_spent=c.total_spent,
        )
        for c in customers
    ]
