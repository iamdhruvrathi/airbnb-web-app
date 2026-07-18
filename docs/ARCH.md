# Architecture

> Living document describing the Airbnb Clone system. Updated as the codebase evolves.

## Overview

Monorepo with separate `frontend/` (Next.js 15) and `backend/` (FastAPI) communicating over REST at `/api/v1`. SQLite stores all persistent data. Authentication, payments, and maps are mocked.

```
┌─────────────┐     REST /api/v1      ┌─────────────┐
│   Next.js   │ ◄──────────────────► │   FastAPI   │
│  (Vercel)   │   X-User-Id header   │  (Render)   │
└─────────────┘                       └──────┬──────┘
                                             │
                                      ┌──────▼──────┐
                                      │   SQLite    │
                                      └─────────────┘
```

---

## Folder Structure

### Root

| Path | Purpose |
|------|---------|
| `frontend/` | Next.js App Router client |
| `backend/` | FastAPI API server |
| `docs/` | Architecture and setup docs |

### Frontend (`frontend/`)

| Path | Purpose |
|------|---------|
| `app/` | Thin route pages — compose feature components only |
| `components/layout/` | Navbar, Footer — shared shell |
| `components/ui/` | Reusable shadcn-style primitives (Button, Card, Dialog…) |
| `features/` | Feature modules with UI + local logic |
| `services/` | Axios API client and typed endpoint functions |
| `types/` | Shared TypeScript interfaces mirroring backend schemas |
| `lib/` | Utilities (cn, formatPrice, formatRating) |
| `hooks/` | Reserved for shared custom hooks |

#### Feature modules

| Feature | Responsibility |
|---------|----------------|
| `home/` | Category filter row |
| `listings/` | Cards, grid, detail, gallery, reviews, skeletons |
| `search/` | Search bar, filter panel |
| `booking/` | Booking widget, trips list, trip detail + review |
| `host/` | Dashboard, CRUD form, listings manager |
| `wishlist/` | Saved favorites view |
| `auth/` | Mock auth provider (user switcher) |

### Backend (`backend/`)

| Path | Purpose |
|------|---------|
| `app/api/v1/` | Route handlers — thin, delegate to services |
| `app/models/` | SQLAlchemy 2 ORM models |
| `app/schemas/` | Pydantic request/response DTOs |
| `app/services/` | Business logic layer |
| `app/repositories/` | Data access layer (repository pattern) |
| `app/database/` | Engine, session, Base |
| `app/core/` | Config, dependency injection (auth deps) |
| `app/utils/` | Custom exceptions, validators |
| `app/seed/` | Database seed script |

---

## Routing

### Frontend routes

| Route | Page | Feature component |
|-------|------|-------------------|
| `/` | Home / explore | `ListingGrid`, `SearchBar`, `CategoryRow` |
| `/listings/[id]` | Listing detail | `ListingDetailView` |
| `/trips` | My trips | `TripsView` |
| `/trips/[id]` | Trip detail + review | `TripDetailView` |
| `/wishlist` | Saved listings | `WishlistView` |
| `/host` | Host dashboard | `HostDashboard` |
| `/host/listings` | Manage listings | `HostListingsManager` |
| `/host/listings/new` | Create listing | `ListingForm` |
| `/host/listings/[id]/edit` | Edit listing | `ListingForm` (prefilled) |

### Backend routes (`/api/v1`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/users` | List demo users |
| POST | `/auth/switch` | Validate user switch |
| GET | `/listings` | Search with filters + pagination |
| GET | `/listings/{id}` | Listing detail |
| GET | `/listings/{id}/availability` | Unavailable date ranges |
| GET | `/listings/{id}/price` | Price breakdown |
| POST/PUT/DELETE | `/listings` | Host CRUD |
| GET | `/amenities` | All amenities |
| POST | `/bookings` | Create booking |
| GET | `/bookings/me` | Guest trips |
| GET | `/bookings/{id}` | Booking detail |
| POST | `/bookings/{id}/cancel` | Cancel booking |
| GET/POST | `/reviews` | List / create reviews |
| GET | `/wishlist` | User wishlist |
| POST | `/wishlist/{id}/toggle` | Toggle favorite |
| GET | `/host/dashboard` | Host stats + listings + bookings |

---

## Component Hierarchy

```
RootLayout
├── Providers (React Query, Theme, Auth, Toaster)
├── Navbar
│   ├── SearchBar (compact)
│   └── User menu (mock auth switcher)
├── main
│   └── [Page-specific feature tree]
└── Footer

HomePage
├── SearchBar (hero)
├── CategoryRow
└── ListingGrid
    ├── FilterPanel
    └── ListingCardItem[]

ListingDetailView
├── ListingGallery
├── Host info + amenities
├── ReviewsSection
├── StaticMap
└── BookingWidget
    └── Checkout Dialog (mock payment)
```

---

## Backend Layers

```
Request → Router → Service → Repository → Database
              ↓
         Pydantic schemas (validation + serialization)
```

- **Router**: HTTP concerns, query params, status codes
- **Service**: Business rules (availability checks, price calc, permissions)
- **Repository**: SQLAlchemy queries, no business logic
- **Models**: Database schema definition

### Exception handling

Custom `AppException` hierarchy (`NotFoundError`, `ConflictError`, `ForbiddenError`) registered in `main.py` returns structured JSON `{ detail, code }`.

---

## Frontend Layers

```
Page (server) → Feature component (client) → services/ → api-client (Axios)
                      ↓
                 React Query (cache + mutations)
                      ↓
                 AuthProvider (X-User-Id header)
```

Business logic stays out of pages. API calls go through typed `services/index.ts`. React Query manages server state.

---

## Database Schema

### Entity Relationship

```
User ──< Listing ──< ListingImage
  │        │
  │        ├──< ListingAmenity >── Amenity
  │        │
  │        ├──< Booking
  │        ├──< Review
  │        └──< WishlistItem >── User
  │
  ├──< Booking (as guest)
  ├──< Review (as author)
  └──< WishlistItem
```

### Tables

| Table | Key fields | Notes |
|-------|-----------|-------|
| `users` | email, name, role, is_superhost | Roles: guest, host |
| `listings` | host_id, title, city, price_per_night, property_type | Indexed on city, price, type |
| `listing_images` | listing_id, url, sort_order | Multiple photos per listing |
| `amenities` | name, icon, category | Seeded lookup table |
| `listing_amenities` | listing_id, amenity_id | M2M junction |
| `bookings` | listing_id, guest_id, check_in, check_out, status | Blocks availability |
| `reviews` | listing_id, author_id, booking_id, rating, comment | Optional booking link |
| `wishlist_items` | user_id, listing_id | Unique per user+listing |

### Indexes

- `users.email`, `listings.city`, `listings.price_per_night`, `listings.property_type`
- `bookings(listing_id, check_in, check_out)` for availability queries

---

## Request Lifecycle

### Search workflow

1. User enters location/dates/guests in `SearchBar` → URL query params
2. `ListingGrid` reads params, calls `GET /listings` via React Query
3. `ListingRepository.search()` applies filters (text, price, type, amenities, date availability)
4. Paginated `ListingCardResponse[]` returned with ratings and wishlist flags

### Booking workflow

1. User selects dates/guests in `BookingWidget`
2. Frontend fetches availability (`GET /listings/{id}/availability`) and price (`GET /listings/{id}/price`)
3. User confirms in mock checkout dialog
4. `POST /bookings` → `BookingService.create()` validates guests, date range, overlap
5. Booking persisted with `CONFIRMED` status → dates blocked for listing
6. User redirected to `/trips/{id}`

### CRUD workflow (Host)

1. Host switches to host user via mock auth
2. Creates listing via `ListingForm` → `POST /listings`
3. `ListingService.create()` validates host role and amenity IDs
4. `ListingRepository.create()` persists listing + images + amenities
5. Edit/delete via `/host/listings` manager

---

## State Management

| State type | Tool | Location |
|-----------|------|----------|
| Server data | React Query | Feature components |
| Auth user | React Context | `AuthProvider` |
| Theme | next-themes | `Providers` |
| URL search/filters | Next.js searchParams | Pages + feature components |
| Form state | React Hook Form + Zod | `ListingForm` |
| Wishlist/trips cache | React Query invalidation | After mutations |

Local UI state (dialogs, menus) uses `useState` in components.

---

## Validation

### Backend (Pydantic)

- Field constraints on schemas (min/max length, positive prices)
- `BookingCreate` validates check_out > check_in
- Service layer: guest count vs max_guests, date overlap, host permissions

### Frontend (Zod)

- `ListingForm` schema validates all listing fields before submit
- Date inputs use shadcn Date Range Pickers (react-day-picker) with min constraints and block unavailable dates
- API errors surfaced via Axios interceptor → toast notifications

---

## Error Handling

| Layer | Strategy |
|-------|----------|
| Backend | Custom exceptions → JSON `{ detail, code }` with proper HTTP status |
| API client | Axios interceptor wraps errors as `Error` messages |
| UI | React Query `isError` states, empty states, Sonner toasts |
| Next.js | `error.tsx`, `not-found.tsx`, `loading.tsx` |

---

## Mocked Integrations

| Feature | Implementation |
|---------|---------------|
| Authentication | `X-User-Id` header + user switcher menu |
| Payments | Dialog with "mock checkout" message |
| Maps | Static OpenStreetMap image via `StaticMap` |
| Image upload | URL input (no cloud storage) |

---

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Root: `frontend/`, env: `NEXT_PUBLIC_API_URL` |
| Backend | Render | `backend/render.yaml`, `Procfile` |

Production checklist:
1. Deploy backend, note URL
2. Set `CORS_ORIGINS` to include Vercel domain
3. Deploy frontend with `NEXT_PUBLIC_API_URL=https://your-api/api/v1`
4. Run seed on backend (`python seed_db.py`)

---

## Future Scalability

- Replace SQLite with PostgreSQL (change `DATABASE_URL`, no code changes needed)
- Replace mock auth with JWT/OAuth2 in `core/deps.py`
- Add Redis for session/cache layer
- Extract search to Elasticsearch for geo/full-text
- Add WebSocket for real-time booking notifications
- Image upload via S3 presigned URLs
- Stripe integration replacing mock checkout dialog
