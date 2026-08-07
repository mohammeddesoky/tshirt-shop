"""
Admin dashboard statistics — order counts, sales totals, top products,
and daily/monthly sales series for charts.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.auth import get_current_admin
from app import models, schemas

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"], dependencies=[Depends(get_current_admin)])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    total_orders = db.query(models.Order).count()
    total_sales = db.query(func.coalesce(func.sum(models.Order.total), 0.0)).scalar()
    total_customers = db.query(models.Customer).count()
    total_products = db.query(models.Product).count()
    pending_orders = db.query(models.Order).filter(models.Order.status == models.OrderStatus.pending).count()

    top = (
        db.query(models.Product.name, func.sum(models.OrderItem.quantity).label("sold"))
        .join(models.OrderItem, models.OrderItem.product_id == models.Product.id)
        .group_by(models.Product.id)
        .order_by(func.sum(models.OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    top_products = [{"name": name, "sold": int(sold)} for name, sold in top]

    since = datetime.utcnow() - timedelta(days=14)
    daily = (
        db.query(func.date(models.Order.created_at).label("day"), func.sum(models.Order.total).label("sales"))
        .filter(models.Order.created_at >= since)
        .group_by(func.date(models.Order.created_at))
        .order_by(func.date(models.Order.created_at))
        .all()
    )
    daily_sales = [{"date": str(d), "sales": float(s or 0)} for d, s in daily]

    since_m = datetime.utcnow() - timedelta(days=365)
    monthly = (
        db.query(func.strftime("%Y-%m", models.Order.created_at).label("month"),
                  func.sum(models.Order.total).label("sales"))
        .filter(models.Order.created_at >= since_m)
        .group_by("month")
        .order_by("month")
        .all()
    )
    monthly_sales = [{"month": m, "sales": float(s or 0)} for m, s in monthly]

    return schemas.DashboardStats(
        total_orders=total_orders, total_sales=float(total_sales or 0), total_customers=total_customers,
        total_products=total_products, pending_orders=pending_orders, top_products=top_products,
        daily_sales=daily_sales, monthly_sales=monthly_sales,
    )
