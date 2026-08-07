"""
Orders API — public order creation + order tracking, admin-protected listing/status updates.
Includes stock validation: an order cannot request more than what's in stock,
and confirmed stock is decremented on order creation.
"""
import random
import string
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.auth import get_current_admin
from app import models, schemas

router = APIRouter(prefix="/api/orders", tags=["Orders"])

SHIPPING_FLAT_RATE = 50.0
FREE_SHIPPING_THRESHOLD = 1500.0


def generate_order_number() -> str:
    return "ORD-" + "".join(random.choices(string.digits, k=8))


@router.post("", response_model=schemas.OrderOut)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    # 1) Validate all items & stock BEFORE writing anything
    line_items = []
    subtotal = 0.0
    for item in payload.items:
        variant = (
            db.query(models.Variant)
            .filter(
                models.Variant.product_id == item.product_id,
                models.Variant.color_id == item.color_id,
                models.Variant.size_id == item.size_id,
            )
            .first()
        )
        if not variant:
            raise HTTPException(400, f"Selected color/size combination is not available for product {item.product_id}")
        if variant.stock < item.quantity:
            raise HTTPException(400, f"Insufficient stock for '{variant.product.name}' "
                                      f"({variant.color.name}/{variant.size.label}). Available: {variant.stock}")
        product = variant.product
        if not product.is_active:
            raise HTTPException(400, f"Product '{product.name}' is no longer available")

        image_url = next((i.url for i in product.images if i.color_id == item.color_id), None) \
            or next((i.url for i in product.images if i.is_primary), None) \
            or (product.images[0].url if product.images else None)

        line_items.append({
            "product": product, "variant": variant, "quantity": item.quantity, "image_url": image_url,
        })
        subtotal += product.price * item.quantity

    shipping = 0.0 if subtotal >= FREE_SHIPPING_THRESHOLD else SHIPPING_FLAT_RATE
    total = subtotal + shipping

    # 2) Find or create customer (by phone)
    customer = db.query(models.Customer).filter(models.Customer.phone == payload.phone).first()
    if not customer:
        customer = models.Customer(name=payload.name, phone=payload.phone)
        db.add(customer)
        db.flush()
    else:
        customer.name = payload.name  # keep name up to date

    # 3) Create order
    order_number = generate_order_number()
    while db.query(models.Order).filter(models.Order.order_number == order_number).first():
        order_number = generate_order_number()

    order = models.Order(
        order_number=order_number, customer_id=customer.id,
        governorate=payload.governorate, city=payload.city, address=payload.address,
        notes=payload.notes, subtotal=subtotal, shipping=shipping, total=total,
        status=models.OrderStatus.pending,
    )
    db.add(order)
    db.flush()

    for li in line_items:
        product, variant = li["product"], li["variant"]
        db.add(models.OrderItem(
            order_id=order.id, product_id=product.id, color_id=variant.color_id, size_id=variant.size_id,
            product_name=product.name, color_name=variant.color.name, size_label=variant.size.label,
            image_url=li["image_url"], unit_price=product.price, quantity=li["quantity"],
        ))
        variant.stock -= li["quantity"]  # decrement stock

    db.commit()
    db.refresh(order)
    return order


@router.post("/track", response_model=schemas.OrderOut)
def track_order(payload: schemas.OrderTrackRequest, db: Session = Depends(get_db)):
    order = (
        db.query(models.Order)
        .join(models.Customer)
        .filter(models.Order.order_number == payload.order_number, models.Customer.phone == payload.phone)
        .first()
    )
    if not order:
        raise HTTPException(404, "Order not found. Check your order number and phone.")
    return order


# ---------------- Admin (protected) ----------------

@router.get("", response_model=List[schemas.OrderOut], dependencies=[Depends(get_current_admin)])
def list_orders(db: Session = Depends(get_db), status: Optional[models.OrderStatus] = None):
    query = db.query(models.Order).options(joinedload(models.Order.items), joinedload(models.Order.customer))
    if status:
        query = query.filter(models.Order.status == status)
    return query.order_by(models.Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=schemas.OrderOut, dependencies=[Depends(get_current_admin)])
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    return order


@router.patch("/{order_id}/status", response_model=schemas.OrderOut, dependencies=[Depends(get_current_admin)])
def update_order_status(order_id: int, payload: schemas.OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(models.Order).get(order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order
