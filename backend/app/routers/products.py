"""
Products API — public read endpoints (list/search/filter/detail)
and admin-protected write endpoints (create/update/delete).
"""
import re
import math
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.database import get_db
from app.auth import get_current_admin
from app import models, schemas

router = APIRouter(prefix="/api/products", tags=["Products"])


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9\u0600-\u06FF\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text or "product"


def to_list_out(p: models.Product) -> schemas.ProductListOut:
    primary = next((i.url for i in p.images if i.is_primary), None) or (p.images[0].url if p.images else None)
    return schemas.ProductListOut(
        id=p.id, name=p.name, slug=p.slug, price=p.price, compare_at_price=p.compare_at_price,
        rating=p.rating, rating_count=p.rating_count, is_active=p.is_active, is_featured=p.is_featured,
        total_stock=p.total_stock, primary_image=primary,
    )


def to_detail_out(p: models.Product) -> schemas.ProductDetailOut:
    return schemas.ProductDetailOut(
        id=p.id, name=p.name, slug=p.slug, description=p.description, price=p.price,
        compare_at_price=p.compare_at_price, rating=p.rating, rating_count=p.rating_count,
        is_active=p.is_active, is_featured=p.is_featured, total_stock=p.total_stock,
        category=p.category, images=p.images, variants=p.variants,
        colors=p.available_colors, sizes=p.available_sizes,
    )


@router.get("", response_model=schemas.PaginatedProducts)
def list_products(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="Search by product name"),
    category_id: Optional[int] = None,
    color_id: Optional[int] = None,
    size_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    sort: Optional[str] = Query("newest", description="newest|price_asc|price_desc|rating"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    include_inactive: bool = False,
):
    query = db.query(models.Product).options(
        joinedload(models.Product.images), joinedload(models.Product.variants)
    )

    if not include_inactive:
        query = query.filter(models.Product.is_active == True)  # noqa: E712
    if q:
        query = query.filter(models.Product.name.ilike(f"%{q}%"))
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    if featured is not None:
        query = query.filter(models.Product.is_featured == featured)
    if color_id or size_id:
        query = query.join(models.Variant)
        if color_id:
            query = query.filter(models.Variant.color_id == color_id)
        if size_id:
            query = query.filter(models.Variant.size_id == size_id)
        query = query.distinct()

    if sort == "price_asc":
        query = query.order_by(models.Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(models.Product.price.desc())
    elif sort == "rating":
        query = query.order_by(models.Product.rating.desc())
    else:
        query = query.order_by(models.Product.created_at.desc())

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = max(1, math.ceil(total / page_size))

    return schemas.PaginatedProducts(
        items=[to_list_out(p) for p in items], total=total, page=page, page_size=page_size, pages=pages
    )


@router.get("/best-sellers", response_model=List[schemas.ProductListOut])
def best_sellers(db: Session = Depends(get_db), limit: int = 8):
    """Ranks products by total quantity sold across all order items."""
    from sqlalchemy import func
    rows = (
        db.query(models.Product, func.coalesce(func.sum(models.OrderItem.quantity), 0).label("sold"))
        .outerjoin(models.OrderItem, models.OrderItem.product_id == models.Product.id)
        .filter(models.Product.is_active == True)  # noqa: E712
        .group_by(models.Product.id)
        .order_by(func.coalesce(func.sum(models.OrderItem.quantity), 0).desc())
        .limit(limit)
        .all()
    )
    return [to_list_out(p) for p, _sold in rows]


@router.get("/new-arrivals", response_model=List[schemas.ProductListOut])
def new_arrivals(db: Session = Depends(get_db), limit: int = 8):
    items = (
        db.query(models.Product)
        .filter(models.Product.is_active == True)  # noqa: E712
        .order_by(models.Product.created_at.desc())
        .limit(limit)
        .all()
    )
    return [to_list_out(p) for p in items]


@router.get("/{slug}", response_model=schemas.ProductDetailOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.slug == slug).first()
    if not p:
        raise HTTPException(404, "Product not found")
    return to_detail_out(p)


@router.get("/{slug}/similar", response_model=List[schemas.ProductListOut])
def similar_products(slug: str, db: Session = Depends(get_db), limit: int = 4):
    p = db.query(models.Product).filter(models.Product.slug == slug).first()
    if not p:
        raise HTTPException(404, "Product not found")
    query = db.query(models.Product).filter(
        models.Product.id != p.id, models.Product.is_active == True  # noqa: E712
    )
    if p.category_id:
        query = query.filter(models.Product.category_id == p.category_id)
    items = query.limit(limit).all()
    return [to_list_out(i) for i in items]


# ---------------- Admin (protected) ----------------

@router.post("", response_model=schemas.ProductDetailOut, dependencies=[Depends(get_current_admin)])
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db)):
    base_slug = slugify(payload.name)
    slug = base_slug
    i = 1
    while db.query(models.Product).filter(models.Product.slug == slug).first():
        i += 1
        slug = f"{base_slug}-{i}"

    product = models.Product(
        name=payload.name, slug=slug, description=payload.description, price=payload.price,
        compare_at_price=payload.compare_at_price, category_id=payload.category_id,
        is_active=payload.is_active, is_featured=payload.is_featured,
    )
    db.add(product)
    db.flush()

    for v in payload.variants:
        db.add(models.Variant(product_id=product.id, color_id=v.color_id, size_id=v.size_id,
                               stock=v.stock, sku=v.sku))

    db.commit()
    db.refresh(product)
    return to_detail_out(product)


@router.put("/{product_id}", response_model=schemas.ProductDetailOut, dependencies=[Depends(get_current_admin)])
def update_product(product_id: int, payload: schemas.ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(models.Product).get(product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return to_detail_out(product)


@router.put("/{product_id}/variants", response_model=schemas.ProductDetailOut, dependencies=[Depends(get_current_admin)])
def replace_variants(product_id: int, variants: List[schemas.VariantIn], db: Session = Depends(get_db)):
    product = db.query(models.Product).get(product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    db.query(models.Variant).filter(models.Variant.product_id == product_id).delete()
    for v in variants:
        db.add(models.Variant(product_id=product_id, color_id=v.color_id, size_id=v.size_id,
                               stock=v.stock, sku=v.sku))
    db.commit()
    db.refresh(product)
    return to_detail_out(product)


@router.delete("/{product_id}", dependencies=[Depends(get_current_admin)])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).get(product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    db.delete(product)
    db.commit()
    return {"detail": "Product deleted"}
