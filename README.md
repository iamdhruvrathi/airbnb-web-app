# Airbnb Clone

A production-quality fullstack Airbnb clone built with **Next.js 15**, **FastAPI**, and **SQLite**. Browse listings, search with filters, book stays, manage host listings, and save favorites — all with an Airbnb-inspired UI.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Python](https://img.shields.io/badge/Python-3.12-yellow)

## Live Demo

> Deploy frontend to **Vercel** and backend to **Render/Railway**. Update these links after deployment:
>
> - **App**: `https://your-app.vercel.app`
> - **API**: `https://your-api.onrender.com`

## Features

- **Home & Search** — Listing grid, search bar (location, dates, guests), category filters, price/bedroom filters, pagination
- **Listing Detail** — Photo gallery, amenities, host info, static map, reviews, booking widget with price breakdown
- **Booking Flow** — Date validation, unavailable date blocking, mock checkout, My Trips, cancel bookings
- **Host Dashboard** — CRUD listings, stats (earnings, bookings, ratings), recent bookings
- **Wishlist** — Save/remove favorites with persistence
- **Reviews** — Leave reviews on completed/confirmed stays (bonus)
- **Dark Mode** — System-aware theme toggle (bonus)
- **Responsive** — Mobile, tablet, and desktop layouts (bonus)

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, shadcn/ui, React Query, React Hook Form, Zod, Axios |
| Backend | FastAPI, SQLAlchemy 2, Pydantic, Alembic, Python 3.12 |
| Database | SQLite |
| Auth | Mock (user switcher + `X-User-Id` header) |
| Payments | Mock checkout dialog |
| Maps | Static OpenStreetMap image |

## Quick Start

See **[docs/SETUP.md](docs/SETUP.md)** for full installation instructions.

```bash
# Backend
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
python seed_db.py
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 — switch users from the avatar menu (top-right).

## Architecture

See **[docs/ARCH.md](docs/ARCH.md)** for the complete system design including:

- Folder structure and layer responsibilities
- Database schema and relationships
- API endpoints
- Request lifecycles (search, booking, CRUD)
- State management and validation
- Deployment guide

## Database Schema

```
users ──< listings ──< listing_images
  │         ├──< listing_amenities >── amenities
  │         ├──< bookings
  │         ├──< reviews
  │         └──< wishlist_items
  ├──< bookings (guest)
  └──< wishlist_items
```

Key relationships:
- **User** (guest/host) owns **Listings** and makes **Bookings**
- **Bookings** block listing availability for overlapping date ranges
- **Reviews** link to listings and optionally to bookings
- **WishlistItems** unique per user + listing

## API Overview

Base URL: `http://localhost:8000/api/v1`

| Endpoint | Description |
|----------|-------------|
| `GET /listings` | Search with filters + pagination |
| `GET /listings/{id}` | Listing detail |
| `POST /bookings` | Create booking |
| `GET /bookings/me` | My trips |
| `GET /host/dashboard` | Host stats |
| `POST /listings` | Create listing (host) |
| `POST /wishlist/{id}/toggle` | Toggle favorite |

Full interactive docs: http://localhost:8000/docs

## Project Structure

```
airbnb-web-app/
├── frontend/          # Next.js App Router
│   ├── app/           # Routes (thin pages)
│   ├── components/    # Layout + UI primitives
│   ├── features/      # Feature-based modules
│   ├── services/      # API client
│   └── types/         # Shared TypeScript types
├── backend/           # FastAPI
│   └── app/
│       ├── api/       # Route handlers
│       ├── models/    # SQLAlchemy models
│       ├── schemas/   # Pydantic DTOs
│       ├── services/  # Business logic
│       └── repositories/  # Data access
└── docs/
    ├── ARCH.md        # Architecture reference
    └── SETUP.md       # Setup instructions
```

## Assumptions

- **No real authentication** — demo users are pre-seeded; switch via UI menu
- **No real payments** — checkout is a confirmation dialog
- **Images via URL** — no file upload or cloud storage
- **Static maps** — OpenStreetMap static image, not interactive
- **SQLite** — suitable for demo; swap to PostgreSQL for production scale

## Deployment

### Frontend (Vercel)

1. Import repo, set root directory to `frontend`
2. Add env: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1`
3. Deploy

### Backend (Render)

1. Use `backend/render.yaml` or create a Web Service
2. Build: `pip install -r requirements.txt && python seed_db.py`
3. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set `CORS_ORIGINS` to your Vercel domain

## License

Built as a fullstack assignment project. For educational purposes.
