# Setup Guide

This guide provides step-by-step instructions for running the Airbnb Web App locally and deploying it to production.

## Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v20 or higher)
- **Python** (v3.12 or higher)
- **Git**

You will also need accounts for:
- [Supabase](https://supabase.com) (Database and Authentication)
- [Google Cloud Console](https://console.cloud.google.com) (For Google OAuth credentials)
- [Cloudinary](https://cloudinary.com) (Optional, for image uploads)

---

## 1. Supabase & Database Configuration

1. Create a new project on [Supabase](https://supabase.com).
2. Go to **Project Settings -> Database** and copy the **Connection string (URI)**.
3. Go to **Project Settings -> API** and copy the **Project URL** and **anon public** key.

---

## 2. Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project.
3. Navigate to **APIs & Services > Credentials**.
4. Create an **OAuth 2.0 Client ID** (Web application).
5. Set the **Authorized JavaScript origins** to `http://localhost:3000` (and your production domain).
6. Set the **Authorized redirect URIs** to `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`.
7. Copy your **Client ID** and **Client Secret**.
8. In your Supabase Dashboard, go to **Authentication > Providers > Google** and input your Google Client ID and Secret. Enable the provider.

---

## 3. Backend Setup

The backend is built with FastAPI.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Backend Environment Variables
Create a `.env` file in the `backend/` directory:

```env
APP_NAME=Airbnb Clone API
# Replace with your Supabase Postgres connection string
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Database Migration & Seeding
Initialize your database and populate it with seed data:

```bash
# Run database migrations
alembic upgrade head

# Seed the database (users, amenities, 12 listings, bookings)
python seed_db.py
```

### Run Backend Server
```bash
uvicorn app.main:app --reload --port 8000
```
The API will be available at `http://localhost:8000`. You can view the interactive Swagger docs at `http://localhost:8000/docs`.

---

## 4. Frontend Setup

The frontend is built with Next.js.

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### Frontend Environment Variables
Create a `.env.local` file in the `frontend/` directory:

```env
# API URL for local development
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Supabase configuration (from Step 1)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# (Optional) Cloudinary configurations if using image uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### Run Frontend Development Server
```bash
npm run dev
```
The web app will be available at `http://localhost:3000`.

---

## 5. Deployment

### Backend (Render / Railway)
1. Link your GitHub repository.
2. Set the Root Directory to `backend`.
3. Set the build command: `pip install -r requirements.txt && alembic upgrade head`
4. Set the start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add your backend environment variables (`DATABASE_URL`).
6. Update `CORS_ORIGINS` to include your production frontend URL.

### Frontend (Vercel)
1. Link your GitHub repository to Vercel.
2. Set the Root Directory to `frontend`.
3. Add your frontend environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_API_URL`, etc.).
4. Deploy the application.

---

## 6. Troubleshooting

- **Database Connection Errors**: Ensure you have allowed all IPs or your specific IP in the Supabase Network settings. If using IPv4 strings from Supabase, ensure they are correct (Supabase is migrating to IPv6).
- **Google Login Fails**: Verify that the Authorized Redirect URIs in Google Cloud exactly match your Supabase project's auth callback URL.
- **CORS Issues on Frontend**: Ensure the `CORS_ORIGINS` environment variable in the backend exactly matches the frontend URL making the request (e.g., no trailing slashes).
