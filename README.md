# Airbnb Web App

A production-quality fullstack Airbnb clone built with **Next.js 15**, **FastAPI**, and **Supabase PostgreSQL**. This application allows users to browse listings, search with advanced filters, book stays, manage host listings, and save favorites—all wrapped in a beautifully polished, modern UI inspired by Airbnb.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Python](https://img.shields.io/badge/Python-3.12-yellow) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)

## 🌟 Live Demo

> **App**: [https://airbnb-web-app.vercel.app](https://airbnb-web-app.vercel.app) (Update link after deployment)  
> **API**: [https://airbnb-api.onrender.com/docs](https://airbnb-api.onrender.com/docs) (Update link after deployment)

## 📸 Screenshots

*(Add screenshots here after deploying your application. Recommended: Homepage, Search Results, Listing Details, and Host Dashboard).*

## ✨ Features

### Guest Experience
- **Home & Explore**: Dynamic listing grid with category rows, stunning responsive layout.
- **Advanced Search**: Filter by location, dates, guests, property type, price range, and amenities.
- **Listing Details**: High-quality photo gallery, amenity lists, host information, static maps, and reviews.
- **Booking Flow**: Real-time date validation, blocking of unavailable dates, and a simulated checkout process.
- **Trips & Wishlists**: View upcoming trips, cancel bookings, and save/remove favorite listings persistently.
- **Reviews**: Leave feedback on completed stays.

### Host Experience
- **Host Dashboard**: View key statistics including total earnings, active listings, and recent bookings.
- **Listing Management**: Complete CRUD operations for your properties.
- **Image Uploads**: Integrated image upload capabilities for listing galleries.

### Technical & UI/UX
- **Google OAuth Authentication**: Secure login flow using Supabase Auth.
- **Responsive Design**: Flawlessly optimized across mobile, tablet, and desktop viewports.
- **Dark Mode**: System-aware theme toggle for comfortable browsing.
- **Micro-Animations**: Smooth entry animations, hover states, and dynamic transitions.

## 💻 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, React Query, React Hook Form, Zod |
| **Backend** | FastAPI, SQLAlchemy 2, Pydantic, Alembic, Python 3.12 |
| **Database** | PostgreSQL (hosted on Supabase) |
| **Auth** | Supabase Auth (Google OAuth) |
| **Media** | Cloudinary (for image uploads) |

## 🏗 Architecture Overview

The system operates as a decoupled monorepo:
- **Frontend**: A Next.js application handling UI, routing, and state management via React Query.
- **Backend**: A high-performance FastAPI service providing a REST API (`/api/v1`).
- **Database**: Supabase PostgreSQL stores all application data, communicating via SQLAlchemy ORM.

For a deep dive into the system design, routing, state management, and database schema, please refer to the **[ARCHITECTURE.md](ARCHITECTURE.md)** file.

## 🚀 Quick Start

To get the project up and running locally, please follow the comprehensive instructions in **[SETUP.md](SETUP.md)**. 

### Prerequisites
- Node.js 20+
- Python 3.12+
- Supabase Account
- Google Cloud Console Account (for OAuth)

## 📂 Project Structure

```
airbnb-web-app/
├── frontend/             # Next.js Application
│   ├── app/              # App Router pages and layouts
│   ├── components/       # Shared UI primitives (shadcn) and layout components
│   ├── features/         # Domain-specific modules (auth, listings, search, etc.)
│   ├── services/         # API client configurations (Axios)
│   └── types/            # TypeScript interfaces mirroring backend schemas
├── backend/              # FastAPI Server
│   ├── app/
│   │   ├── api/          # Route handlers (Controllers)
│   │   ├── core/         # Core configuration and dependencies
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── repositories/ # Data access layer
│   │   ├── schemas/      # Pydantic DTOs for validation
│   │   └── services/     # Business logic layer
│   ├── alembic/          # Database migrations
│   └── seed_db.py        # Database seeding script
├── ARCHITECTURE.md       # Detailed system design documentation
├── SETUP.md              # Local installation and configuration guide
└── README.md             # Project overview (this file)
```

## 🌍 Environment Variables

You will need to configure environment variables for both the frontend and backend. See **[SETUP.md](SETUP.md)** for detailed `.env` templates, which include:
- `DATABASE_URL` (Supabase Postgres connection string)
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Cloudinary keys (if configuring custom uploads)

## 🚢 Deployment

### Frontend (Vercel)
1. Push your code to GitHub.
2. Import the repository into Vercel, setting the Root Directory to `frontend`.
3. Add the required environment variables (Supabase keys, Google OAuth callbacks, API URL).
4. Deploy!

### Backend (Render / Railway)
1. Create a new Web Service and link the GitHub repository.
2. Set the Root Directory to `backend`.
3. Build Command: `pip install -r requirements.txt && alembic upgrade head`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Ensure `CORS_ORIGINS` includes your Vercel frontend URL.

## 🔮 Future Improvements

- **Stripe Integration**: Replace the mock checkout dialog with actual payment processing.
- **Interactive Maps**: Transition from static maps to interactive Google Maps / Mapbox.
- **Real-time Notifications**: Implement WebSockets to notify hosts of new bookings instantly.
- **Advanced Search**: Integrate Elasticsearch or Typesense for typo-tolerant, geospatial search capabilities.

## 📜 License

Built as an educational fullstack assignment project. All rights reserved.
