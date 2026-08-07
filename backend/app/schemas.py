"""
Pydantic schemas used for request validation and response serialization.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from app.models import OrderStatus


# ---------- Color / Size / Category ----------

class ColorBase(BaseModel):
    name: str
    hex_code: str = "#000000"


class ColorOut(ColorBase):
    id: int
    class Config:
        from_attributes = True


class SizeBase(BaseModel):
    label: str
    sort_order: int = 0


class SizeOut(SizeBase):
    id: int
    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str
    slug: str


class CategoryOut(CategoryBase):
    id: int
    class Config:
        from_attributes = True


# ---------- Images / Variants ----------

class ProductImageOut(BaseModel):
    id: int
    url: str
    color_id: Optional[int] = None
    is_primary: bool = False
    sort_order: int = 0
    class Config:
        from_attributes = True


class VariantIn(BaseModel):
    color_id: int
    size_id: int
    stock: int = Field(ge=0)
    sku: Optional[str] = None


class VariantOut(BaseModel):
    id: int
    color: ColorOut
    size: SizeOut
    stock: int
    sku: Optional[str] = None
    class Config:
        from_attributes = True


# ---------- Product ----------

class ProductBase(BaseModel):
    name: str
    description: str = ""
    price: float = Field(gt=0)
    compare_at_price: Optional[float] = None
    category_id: Optional[int] = None
    is_active: bool = True
    is_featured: bool = False


class ProductCreate(ProductBase):
    variants: List[VariantIn] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class ProductListOut(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    compare_at_price: Optional[float] = None
    rating: float
    rating_count: int
    is_active: bool
    is_featured: bool
    total_stock: int
    primary_image: Optional[str] = None

    class Config:
        from_attributes = True


class ProductDetailOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    price: float
    compare_at_price: Optional[float] = None
    rating: float
    rating_count: int
    is_active: bool
    is_featured: bool
    total_stock: int
    category: Optional[CategoryOut] = None
    images: List[ProductImageOut] = []
    variants: List[VariantOut] = []
    colors: List[ColorOut] = []
    sizes: List[SizeOut] = []

    class Config:
        from_attributes = True


class PaginatedProducts(BaseModel):
    items: List[ProductListOut]
    total: int
    page: int
    page_size: int
    pages: int


# ---------- Orders ----------

class OrderItemIn(BaseModel):
    product_id: int
    color_id: int
    size_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    name: str
    phone: str
    governorate: str
    city: str
    address: str
    notes: str = ""
    items: List[OrderItemIn]

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v):
        if not v:
            raise ValueError("Order must contain at least one item")
        return v


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    color_name: Optional[str] = None
    size_label: Optional[str] = None
    image_url: Optional[str] = None
    unit_price: float
    quantity: int
    line_total: float

    class Config:
        from_attributes = True


class CustomerOut(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str] = None

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    order_number: str
    customer: CustomerOut
    governorate: str
    city: str
    address: str
    notes: str
    subtotal: float
    shipping: float
    total: float
    status: OrderStatus
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderTrackRequest(BaseModel):
    order_number: str
    phone: str


# ---------- Customers (admin) ----------

class CustomerAdminOut(BaseModel):
    id: int
    name: str
    phone: str
    email: Optional[str] = None
    total_orders: int
    total_spent: float

    class Config:
        from_attributes = True


# ---------- Auth ----------

class AdminLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminOut(BaseModel):
    id: int
    email: str
    full_name: str

    class Config:
        from_attributes = True


# ---------- Dashboard stats ----------

class DashboardStats(BaseModel):
    total_orders: int
    total_sales: float
    total_customers: int
    total_products: int
    pending_orders: int
    top_products: List[dict]
    daily_sales: List[dict]
    monthly_sales: List[dict]
