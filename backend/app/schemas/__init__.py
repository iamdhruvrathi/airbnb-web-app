from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserRole(str, Enum):
    GUEST = "guest"
    HOST = "host"


class PropertyType(str, Enum):
    APARTMENT = "apartment"
    HOUSE = "house"
    VILLA = "villa"
    CABIN = "cabin"
    LOFT = "loft"
    STUDIO = "studio"
    TOWNHOUSE = "townhouse"
    BEACH_HOUSE = "beach_house"


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel):
    items: list
    meta: PaginationMeta


class ErrorResponse(BaseModel):
    detail: str
    code: str | None = None


class UserBase(BaseModel):
    email: str
    name: str
    avatar_url: str | None = None
    role: UserRole = UserRole.GUEST
    is_superhost: bool = False
    bio: str | None = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class AmenityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    icon: str
    category: str


class ListingImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    alt_text: str | None = None
    sort_order: int
    public_id: str | None = None


class ListingImageCreate(BaseModel):
    url: str
    alt_text: str | None = None
    sort_order: int = 0
    public_id: str | None = None


class ListingBase(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=10)
    property_type: PropertyType
    city: str
    country: str
    address: str
    latitude: float
    longitude: float
    price_per_night: float = Field(gt=0)
    cleaning_fee: float = Field(ge=0, default=0)
    service_fee_percent: float = Field(ge=0, le=100, default=12)
    max_guests: int = Field(ge=1, le=20)
    bedrooms: int = Field(ge=0, le=20)
    beds: int = Field(ge=1, le=20)
    bathrooms: float = Field(ge=0.5, le=20)


class ListingCreate(ListingBase):
    images: list[ListingImageCreate] = Field(min_length=1)
    amenity_ids: list[int] = Field(default_factory=list)


class ListingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=255)
    description: str | None = Field(default=None, min_length=10)
    property_type: PropertyType | None = None
    city: str | None = None
    country: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    price_per_night: float | None = Field(default=None, gt=0)
    cleaning_fee: float | None = Field(default=None, ge=0)
    service_fee_percent: float | None = Field(default=None, ge=0, le=100)
    max_guests: int | None = Field(default=None, ge=1, le=20)
    bedrooms: int | None = Field(default=None, ge=0, le=20)
    beds: int | None = Field(default=None, ge=1, le=20)
    bathrooms: float | None = Field(default=None, ge=0.5, le=20)
    is_active: bool | None = None
    images: list[ListingImageCreate] | None = None
    amenity_ids: list[int] | None = None


class HostSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    avatar_url: str | None = None
    is_superhost: bool
    bio: str | None = None


class ListingCardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    city: str
    country: str
    property_type: PropertyType
    price_per_night: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    primary_image: str | None = None
    average_rating: float | None = None
    review_count: int = 0
    is_wishlisted: bool = False


class ListingDetailResponse(ListingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    host_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    host: HostSummary
    images: list[ListingImageResponse]
    amenities: list[AmenityResponse]
    average_rating: float | None = None
    review_count: int = 0
    is_wishlisted: bool = False


class ListingSearchParams(BaseModel):
    q: str | None = None
    city: str | None = None
    country: str | None = None
    check_in: date | None = None
    check_out: date | None = None
    guests: int | None = Field(default=None, ge=1)
    min_price: float | None = Field(default=None, ge=0)
    max_price: float | None = Field(default=None, ge=0)
    property_type: PropertyType | None = None
    amenity_ids: list[int] | None = None
    min_bedrooms: int | None = Field(default=None, ge=0)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=12, ge=1, le=50)


class PriceBreakdown(BaseModel):
    nightly_rate: float
    nights: int
    subtotal: float
    cleaning_fee: float
    service_fee: float
    total: float


class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int = Field(ge=1, le=20)

    @field_validator("check_out")
    @classmethod
    def validate_check_out(cls, v: date, info) -> date:
        check_in = info.data.get("check_in")
        if check_in and v <= check_in:
            raise ValueError("check_out must be after check_in")
        return v


class BookingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    nights: int
    nightly_rate: float
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: BookingStatus
    created_at: datetime
    listing: ListingCardResponse | None = None


class BookingWithListingResponse(BookingResponse):
    listing: ListingCardResponse


class ReviewCreate(BaseModel):
    listing_id: int
    booking_id: int | None = None
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=10, max_length=2000)


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    author_id: int
    rating: int
    comment: str
    created_at: datetime
    author: HostSummary


class WishlistItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: int
    created_at: datetime
    listing: ListingCardResponse


class AuthSwitchRequest(BaseModel):
    user_id: int


class AuthUserResponse(BaseModel):
    user: UserResponse
    message: str


class HostDashboardStats(BaseModel):
    total_listings: int
    active_listings: int
    total_bookings: int
    total_earnings: float
    average_rating: float | None = None


class HostDashboardResponse(BaseModel):
    stats: HostDashboardStats
    listings: list[ListingCardResponse]
    recent_bookings: list[BookingResponse]
