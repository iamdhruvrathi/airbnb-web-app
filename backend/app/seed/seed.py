"""Seed the database with sample users, listings, bookings, and reviews."""

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app.database.base import Base
from app.models import (
    Amenity,
    Booking,
    BookingStatus,
    Listing,
    ListingAmenity,
    ListingImage,
    PropertyType,
    Review,
    User,
    UserRole,
    WishlistItem,
)

AMENITIES = [
    ("WiFi", "wifi", "essentials"),
    ("Kitchen", "utensils", "essentials"),
    ("Washer", "shirt", "essentials"),
    ("Dryer", "wind", "essentials"),
    ("Air conditioning", "snowflake", "essentials"),
    ("Heating", "flame", "essentials"),
    ("TV", "tv", "features"),
    ("Pool", "waves", "features"),
    ("Hot tub", "bath", "features"),
    ("Free parking", "car", "features"),
    ("Gym", "dumbbell", "features"),
    ("Beach access", "umbrella", "location"),
    ("Mountain view", "mountain", "location"),
    ("City skyline view", "building", "location"),
    ("Workspace", "laptop", "features"),
    ("Pet friendly", "dog", "rules"),
    ("Self check-in", "key", "features"),
    ("Smoke alarm", "bell", "safety"),
    ("Fire extinguisher", "shield", "safety"),
    ("Balcony", "home", "features"),
]

LISTING_TEMPLATES = [
    {
        "title": "Modern Loft in Downtown Austin",
        "description": "Stylish loft with floor-to-ceiling windows, exposed brick, and a rooftop terrace. Walk to restaurants, live music venues, and the Capitol.",
        "property_type": PropertyType.LOFT,
        "city": "Austin",
        "country": "United States",
        "address": "123 Congress Ave, Austin, TX",
        "latitude": 30.2672,
        "longitude": -97.7431,
        "price_per_night": 185,
        "cleaning_fee": 75,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 2.0,
        "images": [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Air conditioning", "Workspace", "Self check-in"],
    },
    {
        "title": "Cozy Beach House in Malibu",
        "description": "Wake up to ocean views in this serene beach house steps from the sand. Perfect for families or a romantic getaway with sunset decks.",
        "property_type": PropertyType.BEACH_HOUSE,
        "city": "Malibu",
        "country": "United States",
        "address": "45 Pacific Coast Hwy, Malibu, CA",
        "latitude": 34.0259,
        "longitude": -118.7798,
        "price_per_night": 420,
        "cleaning_fee": 120,
        "max_guests": 6,
        "bedrooms": 3,
        "beds": 4,
        "bathrooms": 2.5,
        "images": [
            "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Beach access", "Free parking", "Hot tub", "Pet friendly"],
    },
    {
        "title": "Alpine Cabin Retreat in Aspen",
        "description": "Rustic-chic cabin surrounded by pine forests with a wood-burning fireplace, ski storage, and panoramic mountain views.",
        "property_type": PropertyType.CABIN,
        "city": "Aspen",
        "country": "United States",
        "address": "789 Mountain Rd, Aspen, CO",
        "latitude": 39.1911,
        "longitude": -106.8175,
        "price_per_night": 310,
        "cleaning_fee": 95,
        "max_guests": 5,
        "bedrooms": 2,
        "beds": 3,
        "bathrooms": 2.0,
        "images": [
            "https://images.unsplash.com/photo-1518780669347-9e5945930618?w=800",
            "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Heating", "Mountain view", "Free parking", "Fire extinguisher"],
    },
    {
        "title": "Parisian Apartment near Eiffel Tower",
        "description": "Elegant Haussmann-style apartment with parquet floors, a Juliet balcony, and views of the Eiffel Tower sparkling at night.",
        "property_type": PropertyType.APARTMENT,
        "city": "Paris",
        "country": "France",
        "address": "12 Rue de Grenelle, Paris",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "price_per_night": 275,
        "cleaning_fee": 60,
        "max_guests": 3,
        "bedrooms": 1,
        "beds": 2,
        "bathrooms": 1.0,
        "images": [
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
            "https://images.unsplash.com/photo-1523217582562-09bcd055837f?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Heating", "City skyline view", "Washer", "Self check-in"],
    },
    {
        "title": "Tropical Villa with Private Pool in Bali",
        "description": "Open-air villa nestled in lush rice terraces featuring a infinity pool, outdoor shower, and dedicated staff.",
        "property_type": PropertyType.VILLA,
        "city": "Ubud",
        "country": "Indonesia",
        "address": "Jalan Raya Ubud, Bali",
        "latitude": -8.5069,
        "longitude": 115.2625,
        "price_per_night": 350,
        "cleaning_fee": 80,
        "max_guests": 8,
        "bedrooms": 4,
        "beds": 5,
        "bathrooms": 4.0,
        "images": [
            "https://images.unsplash.com/photo-1582268611954-ebfd161ef9cf?w=800",
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
            "https://images.unsplash.com/photo-1600047509807-ba8f99d2cd09?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Pool", "Workspace", "Air conditioning", "Balcony"],
    },
    {
        "title": "Brooklyn Brownstone Studio",
        "description": "Sun-drenched studio in a historic brownstone with original moldings, a murphy bed, and a shared garden patio.",
        "property_type": PropertyType.STUDIO,
        "city": "New York",
        "country": "United States",
        "address": "234 Bedford Ave, Brooklyn, NY",
        "latitude": 40.6782,
        "longitude": -73.9442,
        "price_per_night": 165,
        "cleaning_fee": 55,
        "max_guests": 2,
        "bedrooms": 0,
        "beds": 1,
        "bathrooms": 1.0,
        "images": [
            "https://images.unsplash.com/photo-1536376072261-e996b15d6a0a?w=800",
            "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Heating", "Workspace", "Smoke alarm"],
    },
    {
        "title": "Lakefront House in Lake Tahoe",
        "description": "Spacious lakefront home with a private dock, kayaks, floor-to-ceiling windows, and a stone fireplace for cozy evenings.",
        "property_type": PropertyType.HOUSE,
        "city": "Lake Tahoe",
        "country": "United States",
        "address": "567 Lakeshore Blvd, South Lake Tahoe, CA",
        "latitude": 38.9399,
        "longitude": -119.9772,
        "price_per_night": 395,
        "cleaning_fee": 110,
        "max_guests": 10,
        "bedrooms": 4,
        "beds": 6,
        "bathrooms": 3.0,
        "images": [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
            "https://images.unsplash.com/photo-1605276374104-de6862b9a2a2?w=800",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Free parking", "Heating", "Pet friendly", "Gym"],
    },
    {
        "title": "Minimalist Tokyo Apartment",
        "description": "Design-forward apartment in Shibuya with smart home features, tatami room, and rooftop city views.",
        "property_type": PropertyType.APARTMENT,
        "city": "Tokyo",
        "country": "Japan",
        "address": "3-5 Shibuya, Tokyo",
        "latitude": 35.6762,
        "longitude": 139.6503,
        "price_per_night": 145,
        "cleaning_fee": 40,
        "max_guests": 2,
        "bedrooms": 1,
        "beds": 1,
        "bathrooms": 1.0,
        "images": [
            "https://images.unsplash.com/photo-1540932239982-301d637d3c94?w=800",
            "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
            "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Air conditioning", "City skyline view", "Self check-in"],
    },
    {
        "title": "Desert Oasis in Scottsdale",
        "description": "Mid-century modern home with a resort-style pool, outdoor kitchen, and stunning Sonoran Desert sunsets.",
        "property_type": PropertyType.HOUSE,
        "city": "Scottsdale",
        "country": "United States",
        "address": "890 Camelback Rd, Scottsdale, AZ",
        "latitude": 33.4942,
        "longitude": -111.9261,
        "price_per_night": 290,
        "cleaning_fee": 85,
        "max_guests": 6,
        "bedrooms": 3,
        "beds": 3,
        "bathrooms": 2.5,
        "images": [
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
            "https://images.unsplash.com/photo-1600573472592-401b023a2d9c?w=800",
            "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Pool", "Free parking", "Air conditioning", "Hot tub"],
    },
    {
        "title": "Historic Townhouse in Charleston",
        "description": "Beautifully restored townhouse in the French Quarter with original hardwood floors, a courtyard fountain, and southern charm.",
        "property_type": PropertyType.TOWNHOUSE,
        "city": "Charleston",
        "country": "United States",
        "address": "45 Church St, Charleston, SC",
        "latitude": 32.7765,
        "longitude": -79.9311,
        "price_per_night": 225,
        "cleaning_fee": 70,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 3,
        "bathrooms": 2.0,
        "images": [
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
            "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Free parking", "Balcony", "Smoke alarm", "Heating"],
    },
    {
        "title": "Amalfi Coast Cliffside Villa",
        "description": "Stunning villa perched on the cliffs of Positano with terraced gardens, a plunge pool, and Mediterranean sea views.",
        "property_type": PropertyType.VILLA,
        "city": "Positano",
        "country": "Italy",
        "address": "Via Positano, Amalfi Coast",
        "latitude": 40.6281,
        "longitude": 14.485,
        "price_per_night": 520,
        "cleaning_fee": 150,
        "max_guests": 6,
        "bedrooms": 3,
        "beds": 4,
        "bathrooms": 3.0,
        "images": [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            "https://images.unsplash.com/photo-1600047509807-ba8f99d2cd09?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Pool", "Balcony", "Air conditioning", "Beach access"],
    },
    {
        "title": "Nordic Cabin in Reykjavik",
        "description": "Scandinavian-inspired cabin with geothermal hot tub, northern lights viewing deck, and minimalist Nordic design.",
        "property_type": PropertyType.CABIN,
        "city": "Reykjavik",
        "country": "Iceland",
        "address": "12 Laugavegur, Reykjavik",
        "latitude": 64.1466,
        "longitude": -21.9426,
        "price_per_night": 240,
        "cleaning_fee": 65,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1.5,
        "images": [
            "https://images.unsplash.com/photo-1518780669347-9e5945930618?w=800",
            "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
            "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800",
        ],
        "amenity_names": ["WiFi", "Kitchen", "Hot tub", "Heating", "Mountain view", "Fire extinguisher"],
    },
]

USERS = [
    {
        "email": "guest@demo.com",
        "name": "Alex Rivera",
        "role": UserRole.GUEST,
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
        "bio": "Travel enthusiast exploring the world one stay at a time.",
    },
    {
        "email": "host@demo.com",
        "name": "Jordan Chen",
        "role": UserRole.HOST,
        "is_superhost": True,
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        "bio": "Superhost with 5 years of hosting experience. I love sharing my favorite neighborhoods.",
    },
    {
        "email": "host2@demo.com",
        "name": "Samira Patel",
        "role": UserRole.HOST,
        "is_superhost": True,
        "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
        "bio": "Design-focused host creating memorable stays in unique spaces.",
    },
    {
        "email": "guest2@demo.com",
        "name": "Taylor Brooks",
        "role": UserRole.GUEST,
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
        "bio": "Weekend explorer and foodie.",
    },
]


def seed_amenities(db: Session) -> dict[str, Amenity]:
    amenity_map = {}
    for name, icon, category in AMENITIES:
        amenity = Amenity(name=name, icon=icon, category=category)
        db.add(amenity)
        db.flush()
        amenity_map[name] = amenity
    return amenity_map


def seed_users(db: Session) -> list[User]:
    users = []
    for data in USERS:
        user = User(**data)
        db.add(user)
        db.flush()
        users.append(user)
    return users


def seed_listings(db: Session, hosts: list[User], amenity_map: dict[str, Amenity]) -> list[Listing]:
    listings = []
    for idx, template in enumerate(LISTING_TEMPLATES):
        host = hosts[idx % len(hosts)]
        data = {k: v for k, v in template.items() if k not in ("images", "amenity_names")}
        listing = Listing(host_id=host.id, **data)
        db.add(listing)
        db.flush()

        for order, url in enumerate(template["images"]):
            db.add(ListingImage(listing_id=listing.id, url=url, alt_text=template["title"], sort_order=order))

        for name in template["amenity_names"]:
            db.add(ListingAmenity(listing_id=listing.id, amenity_id=amenity_map[name].id))

        listings.append(listing)
    return listings


def seed_bookings_and_reviews(db: Session, guest: User, listings: list[Listing]) -> None:
    today = date.today()

    booking1 = Booking(
        listing_id=listings[0].id,
        guest_id=guest.id,
        check_in=today + timedelta(days=30),
        check_out=today + timedelta(days=33),
        guests=2,
        nights=3,
        nightly_rate=listings[0].price_per_night,
        cleaning_fee=listings[0].cleaning_fee,
        service_fee=round(listings[0].price_per_night * 3 * 0.12, 2),
        total_price=round(listings[0].price_per_night * 3 + listings[0].cleaning_fee + listings[0].price_per_night * 3 * 0.12, 2),
        status=BookingStatus.CONFIRMED,
    )
    db.add(booking1)
    db.flush()

    booking2 = Booking(
        listing_id=listings[1].id,
        guest_id=guest.id,
        check_in=today + timedelta(days=10),
        check_out=today + timedelta(days=14),
        guests=4,
        nights=4,
        nightly_rate=listings[1].price_per_night,
        cleaning_fee=listings[1].cleaning_fee,
        service_fee=round(listings[1].price_per_night * 4 * 0.12, 2),
        total_price=round(listings[1].price_per_night * 4 + listings[1].cleaning_fee + listings[1].price_per_night * 4 * 0.12, 2),
        status=BookingStatus.CONFIRMED,
    )
    db.add(booking2)

    past_booking = Booking(
        listing_id=listings[2].id,
        guest_id=guest.id,
        check_in=today - timedelta(days=20),
        check_out=today - timedelta(days=17),
        guests=2,
        nights=3,
        nightly_rate=listings[2].price_per_night,
        cleaning_fee=listings[2].cleaning_fee,
        service_fee=round(listings[2].price_per_night * 3 * 0.12, 2),
        total_price=round(listings[2].price_per_night * 3 + listings[2].cleaning_fee + listings[2].price_per_night * 3 * 0.12, 2),
        status=BookingStatus.COMPLETED,
    )
    db.add(past_booking)
    db.flush()

    reviews_data = [
        (listings[0].id, guest.id, 5, "Absolutely loved this loft! Perfect location and the rooftop views were incredible."),
        (listings[1].id, guest.id, 4, "Beautiful beach house. The sunset deck was our favorite spot. Would stay again!"),
        (listings[2].id, guest.id, 5, "The cabin was magical. Cozy fireplace and amazing mountain views. Host was very responsive."),
        (listings[3].id, guest.id, 5, "Dream Paris apartment! Waking up to Eiffel Tower views never gets old."),
        (listings[4].id, guest.id, 5, "Paradise in Bali. The pool overlooking rice terraces is unforgettable."),
    ]

    for listing_id, author_id, rating, comment in reviews_data:
        db.add(Review(listing_id=listing_id, author_id=author_id, rating=rating, comment=comment))

    db.add(WishlistItem(user_id=guest.id, listing_id=listings[3].id))
    db.add(WishlistItem(user_id=guest.id, listing_id=listings[4].id))
    db.add(WishlistItem(user_id=guest.id, listing_id=listings[7].id))


def run_seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        amenity_map = seed_amenities(db)
        users = seed_users(db)
        hosts = [u for u in users if u.role == UserRole.HOST]
        guest = next(u for u in users if u.email == "guest@demo.com")
        listings = seed_listings(db, hosts, amenity_map)
        seed_bookings_and_reviews(db, guest, listings)
        db.commit()
        print(f"Seeded {len(users)} users, {len(listings)} listings, {len(amenity_map)} amenities.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
