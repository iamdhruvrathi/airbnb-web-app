from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import Listing, WishlistItem


class WishlistRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user(self, user_id: int) -> list[WishlistItem]:
        return (
            self.db.query(WishlistItem)
            .options(joinedload(WishlistItem.listing).selectinload(Listing.images))
            .filter(WishlistItem.user_id == user_id)
            .order_by(WishlistItem.created_at.desc())
            .all()
        )

    def get_item(self, user_id: int, listing_id: int) -> WishlistItem | None:
        return (
            self.db.query(WishlistItem)
            .filter(WishlistItem.user_id == user_id, WishlistItem.listing_id == listing_id)
            .first()
        )

    def add(self, user_id: int, listing_id: int) -> WishlistItem:
        item = WishlistItem(user_id=user_id, listing_id=listing_id)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def remove(self, item: WishlistItem) -> None:
        self.db.delete(item)
        self.db.commit()

    def is_wishlisted(self, user_id: int, listing_id: int) -> bool:
        return self.get_item(user_id, listing_id) is not None
