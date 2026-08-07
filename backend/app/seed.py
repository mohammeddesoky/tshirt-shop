"""
Seed the database with demo data: admin user, categories, colors, sizes,
and a handful of sample products with variants.

Run with:  python -m app.seed
"""
from app.database import SessionLocal, Base, engine
from app import models
from app.auth import hash_password
from app.config import settings

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ---- Admin user ----
if not db.query(models.AdminUser).filter(models.AdminUser.email == settings.ADMIN_EMAIL).first():
    db.add(models.AdminUser(
        email=settings.ADMIN_EMAIL,
        hashed_password=hash_password(settings.ADMIN_PASSWORD),
        full_name="Store Admin",
    ))
    print(f"Created admin user: {settings.ADMIN_EMAIL}")

# ---- Categories ----
category_names = ["Classic Tees", "Oversized", "Graphic Print", "Basics"]
categories = {}
for name in category_names:
    slug = name.lower().replace(" ", "-")
    cat = db.query(models.Category).filter(models.Category.slug == slug).first()
    if not cat:
        cat = models.Category(name=name, slug=slug)
        db.add(cat)
        db.flush()
    categories[name] = cat

# ---- Colors ----
color_defs = [("Black", "#111111"), ("White", "#F5F5F5"), ("Navy", "#1B2A4A"),
              ("Green", "#3F6B4A"), ("Beige", "#D9C9AA")]
colors = {}
for name, hexcode in color_defs:
    c = db.query(models.Color).filter(models.Color.name == name).first()
    if not c:
        c = models.Color(name=name, hex_code=hexcode)
        db.add(c)
        db.flush()
    colors[name] = c

# ---- Sizes ----
size_defs = [("S", 1), ("M", 2), ("L", 3), ("XL", 4), ("XXL", 5)]
sizes = {}
for label, order in size_defs:
    s = db.query(models.Size).filter(models.Size.label == label).first()
    if not s:
        s = models.Size(label=label, sort_order=order)
        db.add(s)
        db.flush()
    sizes[label] = s

db.commit()

# ---- Sample products ----
sample_products = [
    {
        "name": "Essential Crew Neck Tee", "category": "Classic Tees", "price": 450,
        "compare_at_price": 550, "featured": True,
        "description": "قميص أساسي مصنوع من قطن 100% مشط، قصة كلاسيكية مريحة تناسب الاستخدام اليومي.",
        "colors": ["Black", "White", "Navy"],
    },
    {
        "name": "Oversized Drop Shoulder Tee", "category": "Oversized", "price": 550,
        "compare_at_price": None, "featured": True,
        "description": "قصة Oversized عصرية بأكتاف منسدلة، قماش ثقيل الوزن لملمس فاخر.",
        "colors": ["Beige", "Black", "Green"],
    },
    {
        "name": "Retro Graphic Print Tee", "category": "Graphic Print", "price": 500,
        "compare_at_price": 600, "featured": False,
        "description": "طبعة جرافيك مستوحاة من الطراز الرترو، طباعة عالية الجودة لا تبهت بالغسيل.",
        "colors": ["White", "Navy"],
    },
    {
        "name": "Basic Pocket Tee", "category": "Basics", "price": 400,
        "compare_at_price": None, "featured": False,
        "description": "تصميم بسيط بجيب أمامي، مثالي للطبقات (Layering).",
        "colors": ["Black", "White", "Beige", "Green"],
    },
]

for sp in sample_products:
    if db.query(models.Product).filter(models.Product.name == sp["name"]).first():
        continue
    slug = sp["name"].lower().replace(" ", "-")
    product = models.Product(
        name=sp["name"], slug=slug, description=sp["description"], price=sp["price"],
        compare_at_price=sp["compare_at_price"], category_id=categories[sp["category"]].id,
        is_featured=sp["featured"], rating=4.5, rating_count=12,
    )
    db.add(product)
    db.flush()

    for idx, color_name in enumerate(sp["colors"]):
        color = colors[color_name]
        db.add(models.ProductImage(
            product_id=product.id, color_id=color.id,
            url=f"https://placehold.co/800x1000/{color.hex_code.lstrip('#')}/FFFFFF?text={sp['name'].replace(' ', '+')}",
            is_primary=(idx == 0), sort_order=idx,
        ))
        for size_label, size in sizes.items():
            db.add(models.Variant(
                product_id=product.id, color_id=color.id, size_id=size.id,
                stock=15 if size_label in ("S", "M", "L") else 6,
            ))

db.commit()
db.close()
print("Seed complete.")
