"""
Image upload endpoint — stores files under the uploads/ directory and
returns a URL that can be attached to a ProductImage.
Protected: only admins can upload.
"""
import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.auth import get_current_admin
from app import models, schemas

router = APIRouter(prefix="/api/upload", tags=["Upload"], dependencies=[Depends(get_current_admin)])

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Unsupported file type")

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(400, f"File too large. Max {settings.MAX_UPLOAD_SIZE_MB}MB")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(contents)

    return {"url": f"/uploads/{filename}"}


@router.post("/product-image/{product_id}", response_model=schemas.ProductImageOut)
async def attach_product_image(product_id: int, color_id: int = None, is_primary: bool = False,
                                file: UploadFile = File(...), db: Session = Depends(get_db)):
    product = db.query(models.Product).get(product_id)
    if not product:
        raise HTTPException(404, "Product not found")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, "Unsupported file type")
    contents = await file.read()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(contents)

    image = models.ProductImage(
        product_id=product_id, color_id=color_id, url=f"/uploads/{filename}", is_primary=is_primary
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image
