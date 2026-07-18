# Setup Guide

## Prerequisites

- **Node.js** 20+
- **Python** 3.12+
- **npm** (comes with Node.js)

## Installation

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Environment Variables

### Backend (`backend/.env`)

```env
APP_NAME=Airbnb Clone API
DATABASE_URL=sqlite:///./airbnb.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Copy from `backend/.env.example`.

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Copy from `frontend/.env.example`.

For production, set `NEXT_PUBLIC_API_URL` to your deployed backend URL and update backend `CORS_ORIGINS` to include your Vercel domain.

## Database Migration

Tables are created automatically on backend startup via SQLAlchemy metadata.

Optional Alembic workflow:

```bash
cd backend
alembic upgrade head
```

## Seed Command

```bash
cd backend
python seed_db.py
```

Seeds users, amenities, 12 listings, bookings, reviews, and wishlist items. Safe to re-run — skips if data already exists.

## Run Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Run Frontend

```bash
cd frontend
npm run dev
```

App: http://localhost:3000

## Mock Authentication

Use the user menu (top-right avatar) to switch between demo users:

| User | Role | Email |
|------|------|-------|
| Alex Rivera | Guest | guest@demo.com |
| Taylor Brooks | Guest | guest2@demo.com |
| Jordan Chen | Host (Superhost) | host@demo.com |
| Samira Patel | Host (Superhost) | host2@demo.com |

No password required — the frontend sends `X-User-Id` header automatically.
