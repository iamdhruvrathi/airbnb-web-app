from datetime import date

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import (
    Amenity,
    Booking,
    BookingStatus,
    Listing,
    ListingAmenity,
    ListingImage,
    PropertyType,
    Review,
    WishlistItem,
)
from app.schemas import ListingCreate, ListingSearchParams, ListingUpdate


class ListingRepository:
    def __init__(self, db: Session):
        self.db = db

    def _base_query(self):
        return self.db.query(Listing).options(
            selectinload(Listing.images),
            selectinload(Listing.amenities).selectinload(ListingAmenity.amenity),
            joinedload(Listing.host),
        )

    def get_by_id(self, listing_id: int) -> Listing | None:
        return self._base_query().filter(Listing.id == listing_id).first()

    def get_by_host(self, host_id: int) -> list[Listing]:
        return (
            self._base_query()
            .filter(Listing.host_id == host_id)
            .order_by(Listing.created_at.desc())
            .all()
        )

    def create(self, listing: Listing, images: list[dict], amenity_ids: list[int]) -> Listing:
        self.db.add(listing)
        self.db.flush()

        for idx, image in enumerate(images):
            self.db.add(
                ListingImage(
                    listing_id=listing.id,
                    url=image["url"],
                    alt_text=image.get("alt_text"),
                    sort_order=image.get("sort_order", idx),
                )
            )

        for amenity_id in amenity_ids:
            self.db.add(ListingAmenity(listing_id=listing.id, amenity_id=amenity_id))

        self.db.commit()
        return self.get_by_id(listing.id)

    def update(self, listing: Listing, data: ListingUpdate) -> Listing:
        update_data = data.model_dump(exclude_unset=True, exclude={"images", "amenity_ids"})
        for field, value in update_data.items():
            setattr(listing, field, value)

        if data.images is not None:
            self.db.query(ListingImage).filter(ListingImage.listing_id == listing.id).delete()
            for idx, image in enumerate(data.images):
                self.db.add(
                    ListingImage(
                        listing_id=listing.id,
                        url=image.url,
                        alt_text=image.alt_text,
                        sort_order=image.sort_order or idx,
                    )
                )

        if data.amenity_ids is not None:
            self.db.query(ListingAmenity).filter(ListingAmenity.listing_id == listing.id).delete()
            for amenity_id in data.amenity_ids:
                self.db.add(ListingAmenity(listing_id=listing.id, amenity_id=amenity_id))

        self.db.commit()
        return self.get_by_id(listing.id)

    def delete(self, listing: Listing) -> None:
        self.db.delete(listing)
        self.db.commit()

    def search(self, params: ListingSearchParams) -> tuple[list[Listing], int]:
        query = self._base_query().filter(Listing.is_active.is_(True))

        if params.q:
            term = f"%{params.q.lower()}%"
            query = query.filter(
                or_(
                    func.lower(Listing.title).like(term),
                    func.lower(Listing.city).like(term),
                    func.lower(Listing.country).like(term),
                    func.lower(Listing.description).like(term),
                    func.lower(Listing.address).like(term),
                )
            )

        if params.city:
            query = query.filter(func.lower(Listing.city).like(f"%{params.city.lower()}%"))

        if params.country:
            query = query.filter(func.lower(Listing.country).like(f"%{params.country.lower()}%"))

        if params.min_price is not None:
            query = query.filter(Listing.price_per_night >= params.min_price)

        if params.max_price is not None:
            query = query.filter(Listing.price_per_night <= params.max_price)

        if params.property_type:
            query = query.filter(Listing.property_type == PropertyType(params.property_type))

        if params.min_bedrooms is not None:
            query = query.filter(Listing.bedrooms >= params.min_bedrooms)

        if params.guests:
            query = query.filter(Listing.max_guests >= params.guests)

        if params.amenity_ids:
            for amenity_id in params.amenity_ids:
                query = query.filter(
                    Listing.id.in_(
                        select(ListingAmenity.listing_id).where(ListingAmenity.amenity_id == amenity_id)
                    )
                )

        if params.check_in and params.check_out:
            unavailable = (
                select(Booking.listing_id)
                .where(
                    Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
                    Booking.check_in < params.check_out,
                    Booking.check_out > params.check_in,
                )
                .scalar_subquery()
            )
            query = query.filter(~Listing.id.in_(unavailable))

        total = query.count()
        listings = (
            query.order_by(Listing.created_at.desc())
            .offset((params.page - 1) * params.page_size)
            .limit(params.page_size)
            .all()
        )
        return listings, total

    def get_rating_stats(self, listing_id: int) -> tuple[float | None, int]:
        result = (
            self.db.query(func.avg(Review.rating), func.count(Review.id))
            .filter(Review.listing_id == listing_id)
            .first()
        )
        avg, count = result or (None, 0)
        return (round(float(avg), 2) if avg is not None else None, int(count or 0))

    def get_ratings_for_listings(self, listing_ids: list[int]) -> dict[int, tuple[float | None, int]]:
        if not listing_ids:
            return {}
        rows = (
            self.db.query(Review.listing_id, func.avg(Review.rating), func.count(Review.id))
            .filter(Review.listing_id.in_(listing_ids))
            .group_by(Review.listing_id)
            .all()
        )
        return {
            listing_id: (round(float(avg), 2) if avg is not None else None, int(count))
            for listing_id, avg, count in rows
        }

    def get_wishlisted_ids(self, user_id: int, listing_ids: list[int]) -> set[int]:
        if not listing_ids:
            return set()
        rows = (
            self.db.query(WishlistItem.listing_id)
            .filter(WishlistItem.user_id == user_id, WishlistItem.listing_id.in_(listing_ids))
            .all()
        )
        return {row[0] for row in rows}

    def get_unavailable_dates(self, listing_id: int) -> list[tuple[date, date]]:
        bookings = (
            self.db.query(Booking.check_in, Booking.check_out)
            .filter(
                Booking.listing_id == listing_id,
                Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
            )
            .all()
        )
        return [(b.check_in, b.check_out) for b in bookings]


class AmenityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Amenity]:
        return self.db.query(Amenity).order_by(Amenity.category, Amenity.name).all()

    def get_by_ids(self, amenity_ids: list[int]) -> list[Amenity]:
        return self.db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
