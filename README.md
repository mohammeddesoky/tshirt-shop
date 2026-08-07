# AfterEight — متجر تيشرتات إلكتروني

منصة تجارة إلكترونية كاملة لبيع التيشرتات، مبنية بـ **React + FastAPI**، جاهزة للاستخدام الفعلي وقابلة للتطوير.

---

## المحتويات

- [Tech Stack](#tech-stack)
- [هيكل المشروع](#هيكل-المشروع)
- [التشغيل محليًا](#التشغيل-محليًا)
- [التشغيل عبر Docker](#التشغيل-عبر-docker)
- [بيانات الدخول الافتراضية للإدارة](#بيانات-الدخول-الافتراضية-للإدارة)
- [الانتقال من SQLite إلى PostgreSQL](#الانتقال-من-sqlite-إلى-postgresql)
- [نشر المشروع](#نشر-المشروع)
- [ربط دومين مجاني](#ربط-دومين-مجاني)
- [الميزات المنفذة والمتبقية](#الميزات-المنفذة-والمتبقية)

---

## Tech Stack

| الطبقة | التقنية |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Routing | React Router v6 |
| Backend | FastAPI (Python) |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite (dev) / PostgreSQL (production-ready) |
| Auth | JWT + bcrypt |

---

## هيكل المشروع

```
tshirt-shop/
├── backend/
│   ├── app/
│   │   ├── main.py            # نقطة الدخول لـ FastAPI
│   │   ├── config.py          # الإعدادات (من .env)
│   │   ├── database.py        # اتصال SQLAlchemy
│   │   ├── models.py          # جداول قاعدة البيانات
│   │   ├── schemas.py         # Pydantic schemas (تحقق من البيانات)
│   │   ├── auth.py            # JWT + bcrypt
│   │   ├── seed.py            # بيانات تجريبية
│   │   └── routers/
│   │       ├── products.py
│   │       ├── orders.py
│   │       ├── auth.py
│   │       ├── customers.py
│   │       ├── meta.py        # فئات / ألوان / مقاسات
│   │       ├── upload.py      # رفع الصور
│   │       └── dashboard.py   # إحصائيات لوحة التحكم
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/              # الصفحات العامة (Home, Shop, Cart...)
│   │   ├── pages/admin/        # لوحة التحكم
│   │   ├── components/         # مكونات قابلة لإعادة الاستخدام
│   │   ├── context/            # Cart / Auth / Toast contexts
│   │   ├── api/client.ts       # طبقة الاتصال بالـ API
│   │   └── types/               # TypeScript types
│   ├── .env.example
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## التشغيل محليًا

### المتطلبات
- Node.js 18+
- Python 3.11+

### 1. الباك إند (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # على Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env            # عدّل القيم إذا لزم الأمر

python -m app.seed              # ينشئ الجداول + مستخدم أدمن + بيانات تجريبية

uvicorn app.main:app --reload --port 8000
```

الباك إند يعمل الآن على: `http://localhost:8000`
توثيق الـ API التفاعلي (Swagger): `http://localhost:8000/docs`

### 2. الفرونت إند (React)

في نافذة طرفية جديدة:

```bash
cd frontend
cp .env.example .env    # اتركه فارغًا للتطوير المحلي (يستخدم الـ proxy التلقائي)

npm install
npm run dev
```

الموقع يعمل الآن على: `http://localhost:5173`

---

## التشغيل عبر Docker

الطريقة الأسرع لتشغيل المشروع بالكامل (باك إند + فرونت إند) بأمر واحد:

```bash
docker compose up --build
```

- الموقع: `http://localhost`
- الـ API: `http://localhost:8000`

يمكنك تخصيص القيم عبر متغيرات البيئة قبل التشغيل، مثال:

```bash
SECRET_KEY=your-long-random-secret ADMIN_PASSWORD=YourStrongPassword docker compose up --build
```

---

## بيانات الدخول الافتراضية للإدارة

بعد تشغيل `python -m app.seed` (أو عند أول تشغيل عبر Docker):

- **الرابط**: `/admin/login`
- **البريد الإلكتروني**: `admin@tshirtshop.com`
- **كلمة المرور**: `Admin@12345`

⚠️ **مهم**: غيّر هذه القيم فورًا في بيئة الإنتاج عبر متغيرات `ADMIN_EMAIL` و`ADMIN_PASSWORD` في ملف `.env` قبل تشغيل seed لأول مرة، وغيّر `SECRET_KEY` إلى قيمة عشوائية طويلة.

---

## الانتقال من SQLite إلى PostgreSQL

بفضل استخدام SQLAlchemy كطبقة تجريد، الانتقال لا يتطلب أي تعديل في الكود — فقط تغيير سطر واحد:

1. ثبّت PostgreSQL أو استخدم خدمة مُدارة (Railway, Render, Supabase, Neon...).
2. أنشئ قاعدة بيانات فارغة.
3. عدّل `DATABASE_URL` في ملف `.env`:

```
# بدلاً من:
DATABASE_URL=sqlite:///./tshirt_shop.db

# استخدم:
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

4. تأكد أن `psycopg2-binary` مثبت (أضفه لـ `requirements.txt` إذا لم يكن موجودًا: `pip install psycopg2-binary`).
5. شغّل `python -m app.seed` مرة أخرى لإنشاء الجداول والبيانات الأساسية على القاعدة الجديدة.

---

## نشر المشروع

### الفرونت إند

**Vercel / Netlify** (الأسهل والموصى به لمشروع Vite):
1. ادفع الكود إلى GitHub.
2. اربط المستودع بـ Vercel أو Netlify.
3. إعدادات البناء: `Build command: npm run build`, `Output directory: dist`.
4. أضف متغير البيئة `VITE_API_BASE_URL` بعنوان الباك إند المنشور (مثال: `https://your-api.onrender.com`).

**GitHub Pages**:
```bash
npm run build
# ثم انشر محتوى مجلد dist عبر gh-pages أو GitHub Actions
```
> ملاحظة: GitHub Pages لا يدعم إعادة التوجيه من جهة السيرفر تلقائيًا لتطبيقات SPA؛ ستحتاج لإضافة ملف `404.html` يعيد التوجيه لـ `index.html`، أو استخدام حزمة مثل `gh-pages` مع إعداد `basename` مناسب في React Router.

### الباك إند

**Render**:
1. أنشئ "New Web Service" واربطه بمستودع GitHub الخاص بمجلد `backend`.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. أضف متغيرات البيئة من `.env.example` (خصوصًا `DATABASE_URL` لقاعدة PostgreSQL مُدارة من Render).

**Railway**:
1. أنشئ مشروعًا جديدًا واربطه بالمستودع.
2. Railway يكتشف تلقائيًا أنه مشروع Python؛ تأكد أن أمر التشغيل هو نفسه أعلاه.
3. أضف قاعدة بيانات PostgreSQL من لوحة Railway مباشرة، وانسخ رابط الاتصال إلى `DATABASE_URL`.

**Fly.io**:
```bash
cd backend
fly launch          # يولّد fly.toml تلقائيًا، اختر عدم إنشاء قاعدة بيانات إذا كنت ستستخدم خدمة خارجية
fly deploy
```
تأكد من ضبط الأسرار عبر: `fly secrets set SECRET_KEY=... DATABASE_URL=...`

بعد نشر الباك إند، **حدّث CORS_ORIGINS** في متغيرات البيئة ليشمل دومين الفرونت إند المنشور.

---

## ربط دومين مجاني

إذا كنت تستضيف الباك إند على سيرفر بعنوان IP ثابت (مثل VPS):

**DuckDNS**:
1. سجّل في [duckdns.org](https://www.duckdns.org) وأنشئ subdomain مجاني (مثال: `yourshop.duckdns.org`).
2. أضف عنوان IP الخاص بسيرفرك.
3. ثبّت سكربت التحديث التلقائي لـ IP (متوفر في لوحة DuckDNS) إذا كان IP ديناميكيًا.

**No-IP**:
1. سجّل في [noip.com](https://www.noip.com) وأنشئ hostname مجاني.
2. اربطه بعنوان IP الخاص بسيرفرك بنفس الطريقة.

> **ملاحظة**: منصات مثل Vercel وNetlify وRender توفر أيضًا دومينات فرعية مجانية جاهزة (`your-app.vercel.app`، إلخ) دون الحاجة لأي إعداد إضافي — وهي الخيار الأبسط لمعظم الحالات.

---

## الميزات المنفذة والمتبقية

هذا المشروع كبير جدًا، وقد رُكّز البناء أولًا على أساس متين وكامل الوظائف الأساسية بجودة إنتاجية حقيقية (وليس Demo). القائمة التالية توضح الحالة بوضوح:

### ✅ منفذ بالكامل
كل ما ورد في الطلب الأساسي: الصفحة الرئيسية، صفحة تفاصيل المنتج مع Gallery وAlوان والمقاسات، الكمية، السلة، Checkout، تتبع الطلب، لوحة تحكم Admin كاملة (منتجات/طلبات/عملاء/إحصائيات مع رسوم بيانية)، البحث، الفلاتر، REST API كاملة، JWT Auth، bcrypt، قاعدة بيانات بكل الجداول والعلاقات المطلوبة، التحقق من المخزون، Responsive design، Dark Mode، Skeleton Loading، Toast Notifications، صفحة 404، صفحة سلة فارغة، SEO meta tags/OG/sitemap/robots.txt، code splitting، Docker كامل، وكل الصفحات الثابتة (من نحن، تواصل معنا، الأسئلة الشائعة، سياسات الاستبدال/الخصوصية/الشروط).

### 🚧 غير منفذ بعد (Bonus Features)
هذه الميزات لم تُبنَ في هذه الجولة لضخامة النطاق، لكن البنية الحالية (خصوصًا نماذج قاعدة البيانات وبنية الـ API) مصممة لتسهيل إضافتها لاحقًا دون إعادة هيكلة:

- **Wishlist (المفضلة)** — يحتاج جدول جديد + صفحة + ربط بحساب المستخدم
- **حسابات المستخدمين** (تسجيل/دخول/نسيان كلمة المرور للعملاء أنفسهم، بخلاف الأدمن) — النظام الحالي يحفظ العميل تلقائيًا برقم الهاتف عند الطلب، لكن لا يوجد تسجيل دخول للعميل
- **تقييمات ومراجعات مكتوبة من العملاء** — حاليًا التقييم (rating) حقل ثابت على المنتج فقط
- **كوبونات الخصم**
- **إشعارات فورية داخل لوحة التحكم عند وصول طلب جديد** (Real-time/WebSocket)

إذا أردت أيًا من هذه الميزات، أخبرني وسأبنيها في جولة تالية بنفس مستوى الجودة.

---

## ملاحظات أمان مهمة قبل الإنتاج

1. غيّر `SECRET_KEY` و`ADMIN_PASSWORD` الافتراضيين.
2. فعّل HTTPS (عبر Render/Vercel/Netlify هذا تلقائي، أو استخدم Let's Encrypt على VPS).
3. قيّد `CORS_ORIGINS` على دومين الإنتاج فقط (لا تتركه مفتوحًا `*`).
4. فعّل نسخ احتياطي دوري لقاعدة البيانات إذا انتقلت لـ PostgreSQL.
