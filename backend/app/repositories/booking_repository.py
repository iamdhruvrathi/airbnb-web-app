from datetime import date

from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import Booking, BookingStatus, Listing
from app.schemas import BookingCreate


class BookingRepository:
    def __init__(self, db: Session):
        self.db = db

    def _with_listing(self):
        return self.db.query(Booking).options(
            joinedload(Booking.listing).selectinload(Listing.images),
            joinedload(Booking.guest),
        )

    def get_by_id(self, booking_id: int) -> Booking | None:
        return self._with_listing().filter(Booking.id == booking_id).first()

    def get_by_guest(self, guest_id: int) -> list[Booking]:
        return (
            self._with_listing()
            .filter(Booking.guest_id == guest_id)
            .order_by(Booking.check_in.desc())
            .all()
        )

    def get_by_listing(self, listing_id: int) -> list[Booking]:
        return (
            self.db.query(Booking)
            .options(joinedload(Booking.guest))
            .filter(Booking.listing_id == listing_id)
            .order_by(Booking.check_in.desc())
            .all()
        )

    def get_by_host(self, host_id: int) -> list[Booking]:
        return (
            self.db.query(Booking)
            .join(Listing)
            .options(joinedload(Booking.listing).selectinload(Listing.images), joinedload(Booking.guest))
            .filter(Listing.host_id == host_id)
            .order_by(Booking.created_at.desc())
            .all()
        )

    def has_overlap(self, listing_id: int, check_in: date, check_out: date, exclude_id: int | None = None) -> bool:
        query = self.db.query(Booking).filter(
            Booking.listing_id == listing_id,
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.PENDING]),
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
        if exclude_id:
            query = query.filter(Booking.id != exclude_id)
        return query.first() is not None

    def create(self, booking: Booking) -> Booking:
        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        return self.get_by_id(booking.id)

    def cancel(self, booking: Booking) -> Booking:
        booking.status = BookingStatus.CANCELLED
        self.db.commit()
        self.db.refresh(booking)
        return booking
