"""
SQLAlchemy ORM models.

Schema overview
----------------
Product          1---N  ProductImage      (gallery / color-specific images)
Product          N---N  Color             (through ProductColor, stores stock per color)
Product          N---N  Size              (through ProductSize, stores stock per size)
Product          1---N  Variant           (a concrete color+size combination with its own stock)
Order            1---N  OrderItem
OrderItem        N---1  Product / Color / Size
Customer         1---N  Order
AdminUser        (separate table, used only for dashboard auth)
"""
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class OrderStatus(str, enum.Enum):
    pending = "Pending"
    confirmed = "Confirmed"
    processing = "Processing"
    shipped = "Shipped"
    delivered = "Delivered"
    cancelled = "Cancelled"


class Color(Base):
    __tablename__ = "colors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)      # e.g. "Black"
    hex_code = Column(String(7), nullable=False, default="#000000")

    variants = relationship("Variant", back_populates="color")


class Size(Base):
    __tablename__ = "sizes"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(10), unique=True, nullable=False)     # S, M, L, XL, XXL
    sort_order = Column(Integer, default=0)

    variants = relationship("Variant", back_populates="size")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    slug = Column(String(220), unique=True, nullable=False, index=True)
    description = Column(Text, default="")
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)  # original price, for discounts
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)     # best sellers flag
    rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("Variant", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")

    @property
    def total_stock(self) -> int:
        return sum(v.stock for v in self.variants)

    @property
    def available_colors(self):
        seen = {}
        for v in self.variants:
            if v.color and v.color.id not in seen:
                seen[v.color.id] = v.color
        return list(seen.values())

    @property
    def available_sizes(self):
        seen = {}
        for v in self.variants:
            if v.size and v.size.id not in seen:
                seen[v.size.id] = v.size
        return list(seen.values())


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    color_id = Column(Integer, ForeignKey("colors.id"), nullable=True)  # image tied to a color, or general
    url = Column(String(500), nullable=False)
    sort_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)

    product = relationship("Product", back_populates="images")
    color = relationship("Color")


class Variant(Base):
    """A concrete (color, size) combination for a product with its own stock."""
    __tablename__ = "variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    color_id = Column(Integer, ForeignKey("colors.id"), nullable=False)
    size_id = Column(Integer, ForeignKey("sizes.id"), nullable=False)
    stock = Column(Integer, default=0)
    sku = Column(String(100), unique=True, nullable=True)

    product = relationship("Product", back_populates="variants")
    color = relationship("Color", back_populates="variants")
    size = relationship("Size", back_populates="variants")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=False, index=True)
    email = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="customer")

    @property
    def total_orders(self) -> int:
        return len(self.orders)

    @property
    def total_spent(self) -> float:
        return sum(o.total for o in self.orders)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(30), unique=True, nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)

    governorate = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    notes = Column(Text, default="")

    subtotal = Column(Float, nullable=False)
    shipping = Column(Float, nullable=False, default=0)
    total = Column(Float, nullable=False)

    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    color_id = Column(Integer, ForeignKey("colors.id"), nullable=True)
    size_id = Column(Integer, ForeignKey("sizes.id"), nullable=True)

    product_name = Column(String(200), nullable=False)  # snapshot at order time
    color_name = Column(String(50), nullable=True)
    size_label = Column(String(10), nullable=True)
    image_url = Column(String(500), nullable=True)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

    @property
    def line_total(self) -> float:
        return self.unit_price * self.quantity


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), default="Admin")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
