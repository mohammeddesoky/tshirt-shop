"""
FastAPI application entrypoint.
Mounts routers, CORS, and serves uploaded images statically.
"""
import os
import app.seed
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.routers import products, orders, auth, customers, meta, upload, dashboard, messages

# Create tables if they don't exist yet (use Alembic migrations for production schema changes)
Base.metadata.create_all(bind=engine)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="T-Shirt Shop API",
    description="REST API for a modern t-shirt e-commerce store.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(customers.router)
app.include_router(meta.router)
app.include_router(upload.router)
app.include_router(messages.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
