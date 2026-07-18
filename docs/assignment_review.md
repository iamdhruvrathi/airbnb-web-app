# Assignment Review

This document reviews the completion status of the Airbnb Web App Fullstack Assignment based on the provided requirements.

## 1. What is Done (Core Features)

- **Home & Search**:
  - Recreated the iconic Airbnb explore view.
  - Grid of listing cards showing photo, location, price, and aggregated rating.
  - Functional search bar (filters by location, dates, and guests) and category/filter row.
  - Pagination integrated on both frontend and backend.
- **Listing Detail Page**:
  - Full photo gallery implementation.
  - Complete listing details (amenities, host info, description, beds/baths/guests).
  - Availability calendar powered by an interactive date-range picker (`react-day-picker`).
  - Dynamic price breakdown (nightly rate × nights + cleaning + service fee).
  - Reviews section with aggregated ratings.
- **Booking Flow**:
  - End-to-end booking mechanism with strict date overlap validation on the backend.
  - "My Trips" dashboard for guests to view and cancel their reservations.
  - Confirmed bookings correctly persist and block out dates on the listing calendar.
  - Mocked checkout confirmation modal.
- **Host Experience (CRUD)**:
  - "My Listings" dashboard to view owned properties and their respective bookings.
  - Full creation flow including title, description, amenities, pricing, and image uploads.
  - Edit and Delete functionality strictly protected by ownership authorization.
- **Airbnb Experience**:
  - High-fidelity UI replicating Airbnb's layout using Tailwind CSS and `shadcn/ui`.
  - Notifications and toast messages handled globally via `sonner`.
  - Working Wishlist functionality to favorite/unfavorite listings.
- **Bonus Objectives Met**:
  - Leave a review functionality.
  - Superhost badges and dynamic rating aggregations.
  - Real cloud image uploads.
  - Full Dark Mode support.
  - Responsive design across mobile, tablet, and desktop.

## 2. What is Yet to be Done

- **Interactive Search Map (Bonus)**: While a static map was implemented on the Listing Details page, the main search page does not yet have an interactive Mapbox/Google Maps overlay with live pricing pins.
- **Root README Compilation**: The documentation currently exists in the `docs/` folder (`ARCH.md` and `SETUP.md`), but a cohesive root `README.md` summarizing the project, tech stack, and DB schema needs to be finalized before submission.
- **Deployment**: The application needs to be hosted (e.g., Vercel for the frontend, Render/Railway for the backend) to fulfill the "Demo" deliverable.

## 3. What is Done Differently (Better Approach)

- **Database**: The rubric suggested SQLite. We originally used SQLite but migrated to **Supabase PostgreSQL**. This is a vastly superior, production-ready approach that provides better relational integrity, concurrency, and cloud scalability.
- **Authentication**: The rubric allowed for mocked/simplified authentication. We bypassed a mock implementation and integrated **Real Google OAuth using Supabase Auth**. Our FastAPI backend securely verifies ES256/RS256 JWTs using Supabase's official JWKS endpoint, offering a highly robust and realistic security architecture.
- **Host vs. Guest Architecture**: Instead of rigid database roles (`UserRole.HOST` vs `UserRole.GUEST`), we adopted Airbnb's actual model: *any* authenticated user can create a listing. A user functionally acts as a host contextually for properties they own, but can simultaneously act as a guest on others. Edit/Delete actions are secured via strict ownership checks (`listing.host_id == current_user.id`) rather than global roles.

## 4. Extra Things Done

- **Cloudinary Media Pipeline**: Instead of storing images locally or relying on raw URLs, we implemented a complete file upload pipeline using Cloudinary, supporting multi-image uploads with format and size validations.
- **Profile Management**: Added a dedicated `/profile` route where users can manage their personal bio, display name, and avatar, which instantly propagates to the "Hosted by" section on their listings.
- **Advanced Data Fetching**: Utilized `@tanstack/react-query` across the frontend for aggressive caching, automatic background refetching, and seamless invalidation (e.g., instantly updating the wishlist heart icon without a page reload).
- **Graceful Error Handling**: Implemented centralized exception handling (`AppException`) in FastAPI to guarantee predictable JSON error payloads across all endpoints.
