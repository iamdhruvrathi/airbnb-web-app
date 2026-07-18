from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_optional_user
from app.database import get_db
from app.models import User
from app.schemas import (
    AuthSwitchRequest,
    AuthUserResponse,
    BookingCreate,
    BookingResponse,
    HostDashboardResponse,
    ListingCreate,
    ListingDetailResponse,
    ListingSearchParams,
    ListingUpdate,
    PaginatedResponse,
    PriceBreakdown,
    ReviewCreate,
    ReviewResponse,
    UserResponse,
    WishlistItemResponse,
)
from app.services import (
    AuthService,
    BookingService,
    HostService,
    ListingService,
    ReviewService,
    WishlistService,
)

router = APIRouter()


@router.get("/auth/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return AuthService(db).get_users()


@router.post("/auth/switch", response_model=AuthUserResponse)
def switch_user(payload: AuthSwitchRequest, db: Session = Depends(get_db)):
    user = AuthService(db).switch_user(payload.user_id)
    return AuthUserResponse(user=UserResponse.model_validate(user), message="Switched user successfully")


@router.get("/listings", response_model=PaginatedResponse)
def search_listings(
    q: str | None = None,
    city: str | None = None,
    country: str | None = None,
    check_in: str | None = None,
    check_out: str | None = None,
    guests: int | None = Query(default=None, ge=1),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    property_type: str | None = None,
    amenity_ids: str | None = None,
    min_bedrooms: int | None = Query(default=None, ge=0),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    from datetime import date as date_type

    from app.schemas import PropertyType

    params = ListingSearchParams(
        q=q,
        city=city,
        country=country,
        check_in=date_type.fromisoformat(check_in) if check_in else None,
        check_out=date_type.fromisoformat(check_out) if check_out else None,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        property_type=PropertyType(property_type) if property_type else None,
        amenity_ids=[int(x) for x in amenity_ids.split(",")] if amenity_ids else None,
        min_bedrooms=min_bedrooms,
        page=page,
        page_size=page_size,
    )
    return ListingService(db).search(params, user.id if user else None)


@router.get("/listings/{listing_id}", response_model=ListingDetailResponse)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    return ListingService(db).get_detail(listing_id, user.id if user else None)


@router.get("/listings/{listing_id}/availability")
def get_availability(listing_id: int, db: Session = Depends(get_db)):
    return ListingService(db).get_unavailable_dates(listing_id)


@router.get("/listings/{listing_id}/price", response_model=PriceBreakdown)
def get_price(
    listing_id: int,
    check_in: str,
    check_out: str,
    db: Session = Depends(get_db),
):
    from datetime import date as date_type

    return ListingService(db).calculate_price(
        listing_id,
        date_type.fromisoformat(check_in),
        date_type.fromisoformat(check_out),
    )


@router.post("/listings", response_model=ListingDetailResponse, status_code=201)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return ListingService(db).create(user, payload)


@router.put("/listings/{listing_id}", response_model=ListingDetailResponse)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return ListingService(db).update(user, listing_id, payload)


@router.delete("/listings/{listing_id}", status_code=204)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ListingService(db).delete(user, listing_id)


@router.get("/amenities")
def list_amenities(db: Session = Depends(get_db)):
    from app.repositories.listing_repository import AmenityRepository
    from app.schemas import AmenityResponse

    amenities = AmenityRepository(db).get_all()
    return [AmenityResponse.model_validate(a) for a in amenities]


@router.post("/bookings", response_model=BookingResponse, status_code=201)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return BookingService(db).create(user, payload)


@router.get("/bookings/me", response_model=list[BookingResponse])
def get_my_trips(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return BookingService(db).get_my_trips(user)


@router.get("/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return BookingService(db).get_by_id(user, booking_id)


@router.post("/bookings/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return BookingService(db).cancel(user, booking_id)


@router.get("/listings/{listing_id}/reviews", response_model=list[ReviewResponse])
def get_reviews(listing_id: int, db: Session = Depends(get_db)):
    return ReviewService(db).get_by_listing(listing_id)


@router.post("/reviews", response_model=ReviewResponse, status_code=201)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return ReviewService(db).create(user, payload)


@router.get("/wishlist", response_model=list[WishlistItemResponse])
def get_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return WishlistService(db).get_items(user)


@router.post("/wishlist/{listing_id}/toggle")
def toggle_wishlist(
    listing_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return WishlistService(db).toggle(user, listing_id)


@router.get("/host/dashboard", response_model=HostDashboardResponse)
def host_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return HostService(db).get_dashboard(user)


@router.get("/host/listings/{listing_id}/bookings", response_model=list[BookingResponse])
def host_listing_bookings(
    listing_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from app.repositories.booking_repository import BookingRepository
    from app.repositories.listing_repository import ListingRepository
    from app.utils.exceptions import ForbiddenError, NotFoundError

    listing = ListingRepository(db).get_by_id(listing_id)
    if not listing:
        raise NotFoundError("Listing")
    if listing.host_id != user.id:
        raise ForbiddenError()
    bookings = BookingRepository(db).get_by_listing(listing_id)
    return [BookingService(db)._to_response(b) for b in bookings]
