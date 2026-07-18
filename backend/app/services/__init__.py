import math
from datetime import date

from sqlalchemy.orm import Session

from app.models import Booking, BookingStatus, Listing, Review, User, UserRole
from app.repositories.booking_repository import BookingRepository
from app.repositories.listing_repository import AmenityRepository, ListingRepository
from app.repositories.review_repository import ReviewRepository
from app.repositories.user_repository import UserRepository
from app.repositories.wishlist_repository import WishlistRepository
from app.schemas import (
    BookingCreate,
    BookingResponse,
    HostDashboardResponse,
    HostDashboardStats,
    HostSummary,
    ListingCardResponse,
    ListingCreate,
    ListingDetailResponse,
    ListingImageResponse,
    ListingSearchParams,
    ListingUpdate,
    PaginatedResponse,
    PaginationMeta,
    PriceBreakdown,
    ReviewCreate,
    ReviewResponse,
    WishlistItemResponse,
)
from app.utils.exceptions import ConflictError, ForbiddenError, NotFoundError, validate_date_range


class ListingService:
    def __init__(self, db: Session):
        self.repo = ListingRepository(db)
        self.amenity_repo = AmenityRepository(db)
        self.wishlist_repo = WishlistRepository(db)

    def _to_card(self, listing: Listing, user_id: int | None = None, ratings: dict | None = None) -> ListingCardResponse:
        rating_data = (ratings or {}).get(listing.id, (None, 0))
        avg_rating, review_count = rating_data if isinstance(rating_data, tuple) else (None, 0)
        if ratings is None:
            avg_rating, review_count = self.repo.get_rating_stats(listing.id)

        is_wishlisted = False
        if user_id:
            is_wishlisted = self.wishlist_repo.is_wishlisted(user_id, listing.id)

        primary_image = listing.images[0].url if listing.images else None
        return ListingCardResponse(
            id=listing.id,
            title=listing.title,
            city=listing.city,
            country=listing.country,
            property_type=listing.property_type,
            price_per_night=listing.price_per_night,
            max_guests=listing.max_guests,
            bedrooms=listing.bedrooms,
            beds=listing.beds,
            bathrooms=listing.bathrooms,
            primary_image=primary_image,
            average_rating=avg_rating,
            review_count=review_count,
            is_wishlisted=is_wishlisted,
        )

    def _to_detail(self, listing: Listing, user_id: int | None = None) -> ListingDetailResponse:
        avg_rating, review_count = self.repo.get_rating_stats(listing.id)
        is_wishlisted = self.wishlist_repo.is_wishlisted(user_id, listing.id) if user_id else False

        from app.schemas import AmenityResponse

        amenities = [AmenityResponse.model_validate(la.amenity) for la in listing.amenities]
        return ListingDetailResponse(
            id=listing.id,
            host_id=listing.host_id,
            title=listing.title,
            description=listing.description,
            property_type=listing.property_type,
            city=listing.city,
            country=listing.country,
            address=listing.address,
            latitude=listing.latitude,
            longitude=listing.longitude,
            price_per_night=listing.price_per_night,
            cleaning_fee=listing.cleaning_fee,
            service_fee_percent=listing.service_fee_percent,
            max_guests=listing.max_guests,
            bedrooms=listing.bedrooms,
            beds=listing.beds,
            bathrooms=listing.bathrooms,
            is_active=listing.is_active,
            created_at=listing.created_at,
            updated_at=listing.updated_at,
            host=HostSummary.model_validate(listing.host),
            images=[ListingImageResponse.model_validate(img) for img in listing.images],
            amenities=amenities,
            average_rating=avg_rating,
            review_count=review_count,
            is_wishlisted=is_wishlisted,
        )

    def search(self, params: ListingSearchParams, user_id: int | None = None) -> PaginatedResponse:
        listings, total = self.repo.search(params)
        listing_ids = [l.id for l in listings]
        ratings = self.repo.get_ratings_for_listings(listing_ids)
        wishlisted = self.repo.get_wishlisted_ids(user_id, listing_ids) if user_id else set()

        items = []
        for listing in listings:
            card = self._to_card(listing, user_id, ratings)
            card.is_wishlisted = listing.id in wishlisted
            items.append(card)

        total_pages = max(1, math.ceil(total / params.page_size))
        return PaginatedResponse(
            items=items,
            meta=PaginationMeta(
                page=params.page,
                page_size=params.page_size,
                total=total,
                total_pages=total_pages,
            ),
        )

    def get_detail(self, listing_id: int, user_id: int | None = None) -> ListingDetailResponse:
        listing = self.repo.get_by_id(listing_id)
        if not listing or not listing.is_active:
            raise NotFoundError("Listing")
        return self._to_detail(listing, user_id)

    def get_unavailable_dates(self, listing_id: int) -> list[dict]:
        listing = self.repo.get_by_id(listing_id)
        if not listing:
            raise NotFoundError("Listing")
        return [
            {"check_in": check_in.isoformat(), "check_out": check_out.isoformat()}
            for check_in, check_out in self.repo.get_unavailable_dates(listing_id)
        ]

    def calculate_price(self, listing_id: int, check_in: date, check_out: date) -> PriceBreakdown:
        listing = self.repo.get_by_id(listing_id)
        if not listing:
            raise NotFoundError("Listing")
        nights = validate_date_range(check_in, check_out)
        subtotal = listing.price_per_night * nights
        service_fee = round(subtotal * (listing.service_fee_percent / 100), 2)
        total = round(subtotal + listing.cleaning_fee + service_fee, 2)
        return PriceBreakdown(
            nightly_rate=listing.price_per_night,
            nights=nights,
            subtotal=round(subtotal, 2),
            cleaning_fee=listing.cleaning_fee,
            service_fee=service_fee,
            total=total,
        )

    def create(self, host: User, data: ListingCreate) -> ListingDetailResponse:
        if host.role != UserRole.HOST:
            raise ForbiddenError("Only hosts can create listings")

        amenities = self.amenity_repo.get_by_ids(data.amenity_ids)
        if len(amenities) != len(set(data.amenity_ids)):
            raise NotFoundError("One or more amenities")

        listing = Listing(
            host_id=host.id,
            title=data.title,
            description=data.description,
            property_type=data.property_type,
            city=data.city,
            country=data.country,
            address=data.address,
            latitude=data.latitude,
            longitude=data.longitude,
            price_per_night=data.price_per_night,
            cleaning_fee=data.cleaning_fee,
            service_fee_percent=data.service_fee_percent,
            max_guests=data.max_guests,
            bedrooms=data.bedrooms,
            beds=data.beds,
            bathrooms=data.bathrooms,
        )
        created = self.repo.create(
            listing,
            [img.model_dump() for img in data.images],
            data.amenity_ids,
        )
        return self._to_detail(created, host.id)

    def update(self, host: User, listing_id: int, data: ListingUpdate) -> ListingDetailResponse:
        listing = self.repo.get_by_id(listing_id)
        if not listing:
            raise NotFoundError("Listing")
        if listing.host_id != host.id:
            raise ForbiddenError("You can only edit your own listings")

        if data.amenity_ids is not None:
            amenities = self.amenity_repo.get_by_ids(data.amenity_ids)
            if len(amenities) != len(set(data.amenity_ids)):
                raise NotFoundError("One or more amenities")

        updated = self.repo.update(listing, data)
        return self._to_detail(updated, host.id)

    def delete(self, host: User, listing_id: int) -> None:
        listing = self.repo.get_by_id(listing_id)
        if not listing:
            raise NotFoundError("Listing")
        if listing.host_id != host.id:
            raise ForbiddenError("You can only delete your own listings")
            
        import cloudinary.uploader
        for img in listing.images:
            if img.public_id:
                try:
                    cloudinary.uploader.destroy(img.public_id)
                except Exception as e:
                    print(f"Failed to delete image {img.public_id}: {e}")

        self.repo.delete(listing)


class BookingService:
    def __init__(self, db: Session):
        self.repo = BookingRepository(db)
        self.listing_repo = ListingRepository(db)
        self.listing_service = ListingService(db)

    def _to_response(self, booking: Booking) -> BookingResponse:
        listing_card = None
        if booking.listing:
            listing_card = self.listing_service._to_card(booking.listing, booking.guest_id)
        return BookingResponse(
            id=booking.id,
            listing_id=booking.listing_id,
            guest_id=booking.guest_id,
            check_in=booking.check_in,
            check_out=booking.check_out,
            guests=booking.guests,
            nights=booking.nights,
            nightly_rate=booking.nightly_rate,
            cleaning_fee=booking.cleaning_fee,
            service_fee=booking.service_fee,
            total_price=booking.total_price,
            status=booking.status,
            created_at=booking.created_at,
            listing=listing_card,
        )

    def create(self, guest: User, data: BookingCreate) -> BookingResponse:
        listing = self.listing_repo.get_by_id(data.listing_id)
        if not listing or not listing.is_active:
            raise NotFoundError("Listing")
        if data.guests > listing.max_guests:
            raise ConflictError(f"This listing allows a maximum of {listing.max_guests} guests")

        nights = validate_date_range(data.check_in, data.check_out)
        if self.repo.has_overlap(listing.id, data.check_in, data.check_out):
            raise ConflictError("Selected dates are not available")

        breakdown = ListingService(self.repo.db).calculate_price(listing.id, data.check_in, data.check_out)
        booking = Booking(
            listing_id=listing.id,
            guest_id=guest.id,
            check_in=data.check_in,
            check_out=data.check_out,
            guests=data.guests,
            nights=nights,
            nightly_rate=listing.price_per_night,
            cleaning_fee=listing.cleaning_fee,
            service_fee=breakdown.service_fee,
            total_price=breakdown.total,
            status=BookingStatus.CONFIRMED,
        )
        created = self.repo.create(booking)
        return self._to_response(created)

    def get_my_trips(self, guest: User) -> list[BookingResponse]:
        bookings = self.repo.get_by_guest(guest.id)
        return [self._to_response(b) for b in bookings]

    def get_by_id(self, user: User, booking_id: int) -> BookingResponse:
        booking = self.repo.get_by_id(booking_id)
        if not booking:
            raise NotFoundError("Booking")
        listing = self.listing_repo.get_by_id(booking.listing_id)
        if booking.guest_id != user.id and (not listing or listing.host_id != user.id):
            raise ForbiddenError()
        return self._to_response(booking)

    def cancel(self, user: User, booking_id: int) -> BookingResponse:
        booking = self.repo.get_by_id(booking_id)
        if not booking:
            raise NotFoundError("Booking")
        if booking.guest_id != user.id:
            raise ForbiddenError("You can only cancel your own bookings")
        if booking.status == BookingStatus.CANCELLED:
            raise ConflictError("Booking is already cancelled")
        cancelled = self.repo.cancel(booking)
        return self._to_response(cancelled)


class ReviewService:
    def __init__(self, db: Session):
        self.repo = ReviewRepository(db)
        self.booking_repo = BookingRepository(db)
        self.listing_repo = ListingRepository(db)

    def get_by_listing(self, listing_id: int) -> list[ReviewResponse]:
        listing = self.listing_repo.get_by_id(listing_id)
        if not listing:
            raise NotFoundError("Listing")
        reviews = self.repo.get_by_listing(listing_id)
        return [ReviewResponse.model_validate(r) for r in reviews]

    def create(self, author: User, data: ReviewCreate) -> ReviewResponse:
        listing = self.listing_repo.get_by_id(data.listing_id)
        if not listing:
            raise NotFoundError("Listing")

        if data.booking_id:
            booking = self.booking_repo.get_by_id(data.booking_id)
            if not booking or booking.guest_id != author.id or booking.listing_id != data.listing_id:
                raise ForbiddenError("Invalid booking for review")
            if booking.status not in (BookingStatus.CONFIRMED, BookingStatus.COMPLETED):
                raise ConflictError("Booking must be confirmed or completed to leave a review")
            if self.repo.get_by_booking(data.booking_id):
                raise ConflictError("Review already exists for this booking")

        review = Review(
            listing_id=data.listing_id,
            author_id=author.id,
            booking_id=data.booking_id,
            rating=data.rating,
            comment=data.comment,
        )
        created = self.repo.create(review)
        return ReviewResponse.model_validate(created)


class WishlistService:
    def __init__(self, db: Session):
        self.repo = WishlistRepository(db)
        self.listing_repo = ListingRepository(db)
        self.listing_service = ListingService(db)

    def get_items(self, user: User) -> list[WishlistItemResponse]:
        items = self.repo.get_by_user(user.id)
        result = []
        for item in items:
            listing_card = self.listing_service._to_card(item.listing, user.id)
            listing_card.is_wishlisted = True
            result.append(
                WishlistItemResponse(
                    id=item.id,
                    listing_id=item.listing_id,
                    created_at=item.created_at,
                    listing=listing_card,
                )
            )
        return result

    def toggle(self, user: User, listing_id: int) -> dict:
        listing = self.listing_repo.get_by_id(listing_id)
        if not listing:
            raise NotFoundError("Listing")

        existing = self.repo.get_item(user.id, listing_id)
        if existing:
            self.repo.remove(existing)
            return {"listing_id": listing_id, "is_wishlisted": False}

        self.repo.add(user.id, listing_id)
        return {"listing_id": listing_id, "is_wishlisted": True}


class HostService:
    def __init__(self, db: Session):
        self.listing_repo = ListingRepository(db)
        self.booking_repo = BookingRepository(db)
        self.listing_service = ListingService(db)

    def get_dashboard(self, host: User) -> HostDashboardResponse:
        if host.role != UserRole.HOST:
            raise ForbiddenError("Only hosts can access the dashboard")

        listings = self.listing_repo.get_by_host(host.id)
        bookings = self.booking_repo.get_by_host(host.id)
        listing_ids = [l.id for l in listings]
        ratings = self.listing_repo.get_ratings_for_listings(listing_ids)

        all_ratings = [r[0] for r in ratings.values() if r[0] is not None]
        avg_rating = round(sum(all_ratings) / len(all_ratings), 2) if all_ratings else None

        confirmed = [b for b in bookings if b.status == BookingStatus.CONFIRMED]
        earnings = sum(b.total_price for b in confirmed)

        cards = [self.listing_service._to_card(l, host.id, ratings) for l in listings]
        recent_bookings = [
            BookingService(self.listing_repo.db)._to_response(b) for b in bookings[:10]
        ]

        return HostDashboardResponse(
            stats=HostDashboardStats(
                total_listings=len(listings),
                active_listings=len([l for l in listings if l.is_active]),
                total_bookings=len(bookings),
                total_earnings=round(earnings, 2),
                average_rating=avg_rating,
            ),
            listings=cards,
            recent_bookings=recent_bookings,
        )


class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def get_users(self) -> list[User]:
        return self.user_repo.get_all()

    def switch_user(self, user_id: int) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User")
        return user
