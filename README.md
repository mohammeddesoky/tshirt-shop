# AfterEight — T-Shirt E-Commerce Store

A complete e-commerce platform for selling T-shirts, built with **React + FastAPI**, ready for real-world use and designed to be scalable.

---

## Table of Contents

* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Local Development](#local-development)
* [Running with Docker](#running-with-docker)
* [Default Admin Credentials](#default-admin-credentials)
* [Migrating from SQLite to PostgreSQL](#migrating-from-sqlite-to-postgresql)
* [Deployment](#deployment)
* [Connecting a Free Domain](#connecting-a-free-domain)
* [Implemented and Remaining Features](#implemented-and-remaining-features)
* [Security Notes Before Production](#security-notes-before-production)

---

## Tech Stack

| Layer          | Technology                                           |
| -------------- | ---------------------------------------------------- |
| Frontend       | React 18 + Vite + TypeScript                         |
| Styling        | Tailwind CSS                                         |
| Icons          | Lucide React                                         |
| Routing        | React Router v6                                      |
| Backend        | FastAPI (Python)                                     |
| ORM            | SQLAlchemy 2.0                                       |
| Database       | SQLite (development) / PostgreSQL (production-ready) |
| Authentication | JWT + bcrypt                                         |

---

## Project Structure

```text
tshirt-shop/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── config.py          # Configuration loaded from .env
│   │   ├── database.py        # SQLAlchemy database connection
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas and validation
│   │   ├── auth.py            # JWT + bcrypt authentication
│   │   ├── seed.py            # Seed data
│   │   └── routers/
│   │       ├── products.py
│   │       ├── orders.py
│   │       ├── auth.py
│   │       ├── customers.py
│   │       ├── meta.py        # Categories / colors / sizes
│   │       ├── upload.py      # Image uploads
│   │       └── dashboard.py   # Dashboard statistics
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # Public pages (Home, Shop, Cart, etc.)
│   │   ├── pages/admin/       # Admin dashboard
│   │   ├── components/        # Reusable components
│   │   ├── context/           # Cart / Auth / Toast contexts
│   │   ├── api/client.ts      # API communication layer
│   │   └── types/             # TypeScript types
│   ├── .env.example
│   └── Dockerfile
│
└── docker-compose.yml
```

---

## Local Development

### Requirements

* Node.js 18+
* Python 3.11+

### 1. Backend (FastAPI)

```bash
cd backend

python -m venv venv

# Windows:
venv\Scripts\activate

# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt

# Windows alternative:
# py -m pip install -r requirements.txt

cp .env.example .env
# On Windows PowerShell, you can copy it with:
# Copy-Item .env.example .env

# Edit the environment variables if needed.

python -m app.seed

uvicorn app.main:app --reload --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

Interactive API documentation (Swagger):

```text
http://localhost:8000/docs
```

### 2. Frontend (React)

Open a **new terminal window**:

```bash
cd frontend

npm install

npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

## Running with Docker

The fastest way to run the entire project (frontend + backend) with one command:

```bash
docker compose up --build
```

After the containers start:

* Website: `http://localhost`
* API: `http://localhost:8000`

You can customize environment variables before starting Docker.

For example:

```bash
SECRET_KEY=your-long-random-secret ADMIN_PASSWORD=YourStrongPassword docker compose up --build
```

---

## Default Admin Credentials

After running:

```bash
python -m app.seed
```

or after the initial Docker startup, the default admin account is:

**Admin URL:**

```text
/admin/login
```

**Email:**

```text
admin@tshirtshop.com
```

**Password:**

```text
Admin@12345
```

⚠️ **Important:** Change these credentials immediately in production.

Set the following environment variables in `.env` before running the seed process for the first time:

```env
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-strong-password
```

Also change:

```env
SECRET_KEY=your-long-random-secret
```

to a long, randomly generated secret.

---

## Migrating from SQLite to PostgreSQL

Because the project uses SQLAlchemy as the database abstraction layer, migrating to PostgreSQL requires minimal code changes.

### 1. Create a PostgreSQL database

You can either install PostgreSQL locally or use a managed service such as:

* Railway
* Render
* Supabase
* Neon

### 2. Update `DATABASE_URL`

Replace:

```env
DATABASE_URL=sqlite:///./tshirt_shop.db
```

with:

```env
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

### 3. Install the PostgreSQL driver

Make sure `psycopg2-binary` is included in `requirements.txt`.

If it is not:

```bash
pip install psycopg2-binary
```

Then add it to `requirements.txt`.

### 4. Run the seed process

```bash
python -m app.seed
```

This will create the required database tables and seed the initial data.

---

# Deployment

## Frontend

The easiest options for deploying the Vite frontend are:

* Vercel
* Netlify

### Vercel / Netlify

1. Push the project to GitHub.
2. Connect the repository to Vercel or Netlify.
3. Configure the build settings:

```text
Build Command:
npm run build

Output Directory:
dist
```

4. Add the following environment variable:

```env
VITE_API_BASE_URL=https://your-api.onrender.com
```

Replace the value with your deployed backend URL.

---

## GitHub Pages

You can also build the frontend using:

```bash
npm run build
```

Then deploy the contents of the `dist` directory using GitHub Pages or GitHub Actions.

> **Note:** GitHub Pages does not automatically support server-side redirects for single-page applications. You may need to add a `404.html` redirect to `index.html` or configure React Router with an appropriate `basename`.

---

# Backend Deployment

## Render

1. Create a new **Web Service**.
2. Connect it to your GitHub repository.
3. Point it to the `backend` directory if your deployment setup requires it.
4. Use:

**Build Command:**

```bash
pip install -r requirements.txt
```

**Start Command:**

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

5. Add the required environment variables, especially:

```env
DATABASE_URL=your-postgresql-database-url
SECRET_KEY=your-secret-key
```

---

## Railway

1. Create a new Railway project.
2. Connect your GitHub repository.
3. Railway should detect the Python backend automatically.
4. Make sure the start command is:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

5. Add a PostgreSQL database through Railway if needed.
6. Set the PostgreSQL connection string as:

```env
DATABASE_URL=your-postgresql-database-url
```

---

## Fly.io

From the backend directory:

```bash
cd backend

fly launch
```

Follow the prompts.

If you are using an external PostgreSQL database, choose not to create a Fly-managed database.

Then deploy:

```bash
fly deploy
```

Set secrets using:

```bash
fly secrets set SECRET_KEY=your-secret-key DATABASE_URL=your-database-url
```

After deploying the backend, make sure `CORS_ORIGINS` includes the production frontend domain.

---

# Connecting a Free Domain

If the backend is hosted on a server with a public/static IP address, you can use a free dynamic DNS service.

## DuckDNS

1. Create an account at DuckDNS.
2. Create a free subdomain, for example:

```text
yourshop.duckdns.org
```

3. Point the hostname to your server's IP address.
4. If the IP is dynamic, configure DuckDNS's automatic IP update script.

## No-IP

You can also use No-IP to create a free hostname and associate it with your server's IP address.

> **Note:** For most users, Vercel, Netlify, and Render are easier because they already provide free subdomains such as:

```text
yourshop.vercel.app
yourshop.netlify.app
yourshop.onrender.com
```

No separate domain configuration is required.

---

# Implemented and Remaining Features

The project was designed around a solid production-style foundation rather than a simple demo.

## ✅ Fully Implemented

The following core features are implemented:

* Home page
* Product listing / Shop page
* Product details
* Product image gallery
* Product colors
* Product sizes
* Quantity selection
* Shopping cart
* Checkout
* Order tracking
* Admin dashboard
* Product management
* Order management
* Customer management
* Dashboard statistics
* Dashboard charts
* Search
* Product filters
* REST API
* JWT authentication
* bcrypt password hashing
* Database models and relationships
* Stock validation
* Responsive design
* Dark mode
* Skeleton loading
* Toast notifications
* Empty cart state
* 404 page
* SEO meta tags
* Open Graph metadata
* Sitemap
* Robots.txt
* Code splitting
* Docker support
* About page
* Contact page
* FAQ
* Return policy
* Privacy policy
* Terms and conditions

---

## 🚧 Bonus Features Not Yet Implemented

The following features were intentionally left for a future development phase due to the large scope of the project.

The current architecture is designed to support them without requiring a major rewrite.

### Wishlist

Requires:

* Wishlist database table
* Wishlist API
* Wishlist page
* User account integration

### Customer Accounts

Currently, customers are automatically stored using their phone number when placing an order.

Customer authentication is not yet implemented.

Future support can include:

* Customer registration
* Customer login
* Forgot password
* Password reset
* Customer profile
* Order history

### Customer Reviews

Currently, products have a fixed rating field.

Future support can include:

* Written customer reviews
* Star ratings
* Review moderation
* Verified purchase reviews

### Discount Coupons

Future support can include:

* Percentage discounts
* Fixed discounts
* Expiration dates
* Minimum order amounts
* Coupon validation

### Real-Time Admin Notifications

Future support can include:

* New order notifications
* WebSocket integration
* Real-time dashboard updates
* Browser notifications

---

# Security Notes Before Production

Before deploying the application publicly, make sure to:

### 1. Change the default secrets

Change:

```env
SECRET_KEY=...
ADMIN_PASSWORD=...
```

Never use the default development credentials in production.

### 2. Enable HTTPS

Use HTTPS in production.

Platforms such as Vercel, Netlify, and Render provide HTTPS automatically.

If you deploy to your own VPS, use Let's Encrypt or another trusted certificate provider.

### 3. Restrict CORS

Do not leave CORS open with:

```text
*
```

Instead, specify your actual production frontend domain.

For example:

```env
CORS_ORIGINS=https://yourshop.vercel.app
```

### 4. Use PostgreSQL in production

SQLite is suitable for local development and testing.

For a real e-commerce application, PostgreSQL is recommended.

### 5. Back Up the Database

If you migrate to PostgreSQL, configure regular database backups.

---

# Recommended Production Architecture

For a simple and affordable deployment, the recommended architecture is:

```text
                    Customer
                       │
                       ▼
             ┌─────────────────┐
             │     Vercel      │
             │ React Frontend  │
             └────────┬────────┘
                      │
                      │ HTTPS / REST API
                      ▼
             ┌─────────────────┐
             │     Render      │
             │ FastAPI Backend │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │   PostgreSQL    │
             │    Database     │
             └─────────────────┘
```

This setup keeps the initial deployment simple, inexpensive, and easy to maintain while leaving room for the application to scale later.
