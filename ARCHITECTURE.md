# System Architecture

This document describes the high-level architecture and system design of the Airbnb Web App. It is designed to be highly scalable, maintaining a strict separation of concerns between the client and server.

## Overview

The application follows a decoupled client-server architecture:
- **Client (Frontend)**: Built with Next.js 15 (App Router), rendering React components and managing state.
- **Server (Backend)**: Built with FastAPI (Python), serving RESTful endpoints.
- **Database**: PostgreSQL hosted on Supabase, accessed via SQLAlchemy ORM.

```mermaid
graph TD
    Client[Next.js Frontend\n(Vercel)] <-->|REST API /api/v1| Server[FastAPI Backend\n(Render)]
    Server <-->|SQLAlchemy| DB[(Supabase PostgreSQL)]
    Client <-->|OAuth / Session| Auth[(Supabase Auth)]
```

---

## Folder Structure

### Frontend (`frontend/`)

| Path | Responsibility |
|------|----------------|
| `app/` | Next.js App Router definitions. Thin pages composing feature modules. |
| `components/`| Reusable UI primitives (shadcn/ui), layouts (Navbar, Footer), and providers. |
| `features/` | Domain-specific logic and UI (e.g., `auth/`, `listings/`, `search/`, `host/`). |
| `services/` | Axios HTTP client configurations and typed API request methods. |
| `types/` | TypeScript interfaces mirroring backend Pydantic schemas. |
| `hooks/` | Custom shared React hooks. |
| `lib/` | Utility functions (formatting, class merging). |

### Backend (`backend/`)

| Path | Responsibility |
|------|----------------|
| `app/api/v1/` | FastAPI route handlers. Delegates complex logic to services. |
| `app/core/` | Application configuration, environment variables, and dependencies. |
| `app/models/` | SQLAlchemy ORM database models. |
| `app/schemas/` | Pydantic data transfer objects (DTOs) for request/response validation. |
| `app/services/` | Core business logic layer (e.g., availability checks, pricing calculations). |
| `app/repositories/`| Data access layer abstracts database queries (Repository Pattern). |
| `alembic/` | Database migration scripts. |

---

## Authentication Flow

The application uses **Supabase Auth** integrated with **Google OAuth**:

1. User clicks "Continue with Google" on the frontend.
2. Frontend initiates OAuth flow via `@supabase/ssr` client.
3. Upon successful Google authentication, Supabase issues a session.
4. The frontend routes the user appropriately, dynamically constructing the callback URL to avoid environment routing issues (Vercel protection screens).
5. Frontend includes the authenticated user context in requests to the backend.

*(Note: During development, mock headers or tokens can be used depending on local setup configurations).*

---

## Database Schema (PostgreSQL)

The database models the relationships between users, listings, and bookings.

### Key Entities

- **Users**: Represents both Guests and Hosts. Contains roles (`guest`, `host`).
- **Listings**: Properties available for booking. Includes price, location, and host reference.
- **Listing Images**: Multiple images associated with a single listing.
- **Amenities**: Lookup table for property features (e.g., WiFi, Pool).
- **Bookings**: Tracks reservation dates, preventing double-booking through overlap validation.
- **Reviews**: Guest feedback linked to specific listings.
- **Wishlists**: Many-to-many relationship tracking saved properties for users.

### Entity Relationship Diagram

```
User (1) ─── (N) Listing (1) ─── (N) ListingImage
  │                 │
  │                 ├── (N) ListingAmenity ── (1) Amenity
  │                 │
  │                 ├── (N) Booking
  │                 └── (N) Review
  │
  ├── (N) Booking (as Guest)
  ├── (N) Review (as Author)
  └── (N) WishlistItem ── (1) Listing
```

---

## Request Lifecycle (Example: Booking a Stay)

To understand how layers interact, here is the flow for creating a booking:

1. **Client UI**: User selects dates in the `BookingWidget` component.
2. **Client Validation**: Zod ensures dates are selected and check-out is after check-in.
3. **API Request**: Axios sends a `POST /api/v1/bookings` request.
4. **Backend Router**: FastAPI receives the request and validates the JSON body against the `BookingCreate` Pydantic schema.
5. **Service Layer**: `BookingService.create()` verifies:
   - The user exists and has permission.
   - The requested dates do not overlap with existing `CONFIRMED` bookings.
6. **Repository Layer**: `BookingRepository.create()` executes the `INSERT` SQL query via SQLAlchemy.
7. **Response**: The backend returns the created booking JSON.
8. **Client State**: React Query invalidates the `trip-cache`, triggering a UI re-render, and the user is redirected to their Trips dashboard.

---

## State Management

- **Server State**: Managed by `@tanstack/react-query`. Caches API responses, handles loading/error states, and manages cache invalidation after mutations.
- **Form State**: Handled securely via `react-hook-form` combined with `zod` for strict schema validation.
- **Authentication**: Managed through React Context via the `AuthProvider`.
- **UI State**: Local component state (`useState`) handles ephemeral UI elements like dropdowns and dialogs.
- **Routing/Filtering**: URL Query parameters (searchParams) drive search filters to ensure shareable links.

---

## Error Handling

- **Backend**: Raises custom exceptions (`NotFoundError`, `ConflictError`, `ForbiddenError`) which a global exception handler catches and formats into standardized JSON responses (`{ "detail": "...", "code": "..." }`) with appropriate HTTP status codes.
- **Frontend**: Axios interceptors capture API errors, parse the JSON payload, and surface user-friendly messages via `sonner` toast notifications.

---

## Deployment Architecture

- **Frontend (Vercel)**: Leverages Vercel's edge network for incredibly fast static asset delivery and Server-Side Rendering (SSR).
- **Backend (Render)**: Hosted as a Web Service. Configured with Uvicorn workers to serve the FastAPI application asynchronously.
- **Database (Supabase)**: Hosted on AWS/GCP via Supabase. Provides connection pooling (PgBouncer) for efficient database connections from the backend.
