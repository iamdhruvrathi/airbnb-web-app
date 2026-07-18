"""Seed the database with sample users, listings, bookings, and reviews for Indian destinations."""

import random
from datetime import date, timedelta

import cloudinary
import cloudinary.uploader
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app.database.base import Base
from app.models import (
    Amenity, Booking, BookingStatus, Listing, ListingAmenity,
    ListingImage, PropertyType, Review, User, UserRole, WishlistItem,
)
from app.core.config import settings

# Fixed random seed for deterministic generation
random.seed(42)

AMENITIES = [
    ("WiFi", "wifi", "essentials"),
    ("Kitchen", "utensils", "essentials"),
    ("Washer", "shirt", "essentials"),
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
    ("Balcony", "home", "features"),
]

USERS = [
    {
        "email": "aarav.host@demo.com",
        "name": "Aarav Sharma",
        "role": UserRole.HOST,
        "is_superhost": True,
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
        "bio": "Superhost with a passion for sharing the best of India. I love hosting!",
    },
    {
        "email": "priya.host@demo.com",
        "name": "Priya Patel",
        "role": UserRole.HOST,
        "is_superhost": True,
        "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
        "bio": "Design-focused host creating memorable stays in unique spaces across Goa and Kerala.",
    },
    {
        "email": "rohan.host@demo.com",
        "name": "Rohan Desai",
        "role": UserRole.HOST,
        "is_superhost": False,
        "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
        "bio": "Mountain lover and adventure enthusiast.",
    },
    {
        "email": "guest1@demo.com",
        "name": "Ananya Singh",
        "role": UserRole.GUEST,
        "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
        "bio": "Travel enthusiast exploring the world one stay at a time.",
    },
    {
        "email": "guest2@demo.com",
        "name": "Vikram Malhotra",
        "role": UserRole.GUEST,
        "avatar_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
        "bio": "Weekend explorer and foodie.",
    },
    {
        "email": "guest3@demo.com",
        "name": "Neha Gupta",
        "role": UserRole.GUEST,
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
        "bio": "Digital nomad looking for the best Wi-Fi and views.",
    },
    {
        "email": "guest4@demo.com",
        "name": "Kabir Khan",
        "role": UserRole.GUEST,
        "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
        "bio": "Always on the move.",
    }
]

CITIES = [
    ("Bengaluru", 12.9716, 77.5946, PropertyType.APARTMENT),
    ("Mumbai", 19.0760, 72.8777, PropertyType.APARTMENT),
    ("Delhi", 28.7041, 77.1025, PropertyType.HOUSE),
    ("Goa", 15.2993, 74.1240, PropertyType.VILLA),
    ("Jaipur", 26.9124, 75.7873, PropertyType.TOWNHOUSE),
    ("Udaipur", 24.5854, 73.7125, PropertyType.HOUSE),
    ("Manali", 32.2396, 77.1887, PropertyType.CABIN),
    ("Shimla", 31.1048, 77.1734, PropertyType.CABIN),
    ("Ooty", 11.4102, 76.6950, PropertyType.CABIN),
    ("Munnar", 10.0889, 77.0595, PropertyType.CABIN),
    ("Coorg", 12.3375, 75.8069, PropertyType.VILLA),
    ("Wayanad", 11.6854, 76.1320, PropertyType.HOUSE),
    ("Alleppey", 9.4981, 76.3388, PropertyType.HOUSE),
    ("Hampi", 15.3350, 76.4600, PropertyType.HOUSE),
    ("Mysuru", 12.2958, 76.6394, PropertyType.HOUSE),
    ("Hyderabad", 17.3850, 78.4867, PropertyType.APARTMENT),
    ("Chennai", 13.0827, 80.2707, PropertyType.APARTMENT),
    ("Kochi", 9.9312, 76.2673, PropertyType.VILLA),
    ("Srinagar", 34.0837, 74.7973, PropertyType.HOUSE),
    ("Leh", 34.1526, 77.5771, PropertyType.CABIN),
]

ADJECTIVES = ["Beautiful", "Serene", "Cozy", "Luxury", "Modern", "Historic", "Peaceful", "Stunning", "Charming", "Spacious"]
NOUNS = ["Retreat", "Getaway", "Haven", "Oasis", "Hideaway", "Sanctuary", "Home", "Villa", "Cabin", "Stay"]

UNSPLASH_URLS = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
    "https://images.unsplash.com/photo-1582268611954-ebfd161ef9cf?w=800",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    "https://images.unsplash.com/photo-1518780669347-9e5945930618?w=800",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
]

UPLOADED_IMAGES = []

def get_cloudinary_images() -> list[str]:
    global UPLOADED_IMAGES
    if UPLOADED_IMAGES:
        return UPLOADED_IMAGES
    
    if not settings.CLOUDINARY_CLOUD_NAME:
        print("Cloudinary not configured. Falling back to Unsplash URLs.")
        UPLOADED_IMAGES = UNSPLASH_URLS
        return UPLOADED_IMAGES
        
    print("Uploading sample images to Cloudinary (this might take a minute)...")
    for i, url in enumerate(UNSPLASH_URLS):
        try:
            res = cloudinary.uploader.upload(url, folder="airbnb_seed")
            UPLOADED_IMAGES.append(res.get("secure_url"))
            print(f"Uploaded {i+1}/{len(UNSPLASH_URLS)}")
        except Exception as e:
            print(f"Failed to upload {url}: {e}")
            UPLOADED_IMAGES.append(url)
    
    return UPLOADED_IMAGES

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

def generate_listings(db: Session, hosts: list[User], amenity_map: dict[str, Amenity], image_urls: list[str]) -> list[Listing]:
    listings = []
    
    # Generate 40 listings
    for i in range(40):
        city, lat, lng, prop_type = random.choice(CITIES)
        host = random.choice(hosts)
        
        # Add slight randomness to coordinates
        lat += random.uniform(-0.02, 0.02)
        lng += random.uniform(-0.02, 0.02)
        
        adj = random.choice(ADJECTIVES)
        noun = random.choice(NOUNS)
        title = f"{adj} {noun} in {city}"
        
        desc = f"Experience the best of {city} in this {adj.lower()} {prop_type.value}. " \
               f"Perfect for families, couples, or solo travelers. Enjoy a fully equipped space " \
               f"with everything you need for a comfortable stay."

        bedrooms = random.randint(1, 5)
        beds = bedrooms + random.randint(0, 2)
        max_guests = beds * 2
        price = random.randint(30, 250) * 10  # Roughly 300 to 2500 INR/equivalent
        
        listing = Listing(
            host_id=host.id,
            title=title,
            description=desc,
            property_type=prop_type,
            city=city,
            country="India",
            address=f"Central {city}, India",
            latitude=lat,
            longitude=lng,
            price_per_night=price,
            cleaning_fee=price * 0.2,
            max_guests=max_guests,
            bedrooms=bedrooms,
            beds=beds,
            bathrooms=random.choice([1.0, 1.5, 2.0, 3.0])
        )
        db.add(listing)
        db.flush()
        
        # Add 3 to 6 images
        num_images = random.randint(3, 6)
        selected_images = random.sample(image_urls, num_images)
        for order, url in enumerate(selected_images):
            db.add(ListingImage(listing_id=listing.id, url=url, alt_text=title, sort_order=order))
            
        # Add amenities
        num_amenities = random.randint(5, 12)
        selected_amenities = random.sample(list(amenity_map.values()), num_amenities)
        for amenity in selected_amenities:
            db.add(ListingAmenity(listing_id=listing.id, amenity_id=amenity.id))
            
        listings.append(listing)
        
    return listings

def seed_bookings_and_reviews(db: Session, guests: list[User], listings: list[Listing]) -> None:
    today = date.today()
    
    review_comments = [
        "Absolutely amazing stay! The host was super responsive and the place was spotless.",
        "Great location, walking distance to everything. Would highly recommend.",
        "Beautiful property but the Wi-Fi was a bit spotty at times.",
        "Had a wonderful time here. The views were breathtaking.",
        "Very clean and comfortable. Check-in was a breeze.",
        "Perfect getaway spot. We enjoyed the peaceful neighborhood.",
        "The place looked exactly like the pictures. Fantastic experience.",
        "Good value for money. The host gave us great local recommendations.",
        "Incredible! 5 stars all around.",
        "Nice place, slightly noisy at night but overall good."
    ]
    
    for listing in listings:
        # Generate 3-6 reviews for each listing
        num_reviews = random.randint(3, 6)
        reviewers = random.sample(guests, min(num_reviews, len(guests)))
        
        for idx, reviewer in enumerate(reviewers):
            rating = random.choices([5, 4, 3], weights=[70, 20, 10])[0]
            comment = random.choice(review_comments)
            
            # Create a past booking for the review
            past_check_in = today - timedelta(days=random.randint(10, 100))
            nights = random.randint(2, 7)
            past_check_out = past_check_in + timedelta(days=nights)
            
            booking = Booking(
                listing_id=listing.id,
                guest_id=reviewer.id,
                check_in=past_check_in,
                check_out=past_check_out,
                guests=random.randint(1, listing.max_guests),
                nights=nights,
                nightly_rate=listing.price_per_night,
                cleaning_fee=listing.cleaning_fee,
                service_fee=listing.price_per_night * nights * 0.12,
                total_price=(listing.price_per_night * nights) + listing.cleaning_fee + (listing.price_per_night * nights * 0.12),
                status=BookingStatus.COMPLETED
            )
            db.add(booking)
            db.flush()
            
            review = Review(
                listing_id=listing.id,
                author_id=reviewer.id,
                booking_id=booking.id,
                rating=rating,
                comment=comment,
                created_at=past_check_in + timedelta(days=nights + 1)
            )
            db.add(review)
        
        # Create a few upcoming blocked bookings to show calendar blocking
        if random.random() > 0.5:
            future_check_in = today + timedelta(days=random.randint(1, 14))
            nights = random.randint(2, 5)
            
            future_booking = Booking(
                listing_id=listing.id,
                guest_id=random.choice(guests).id,
                check_in=future_check_in,
                check_out=future_check_in + timedelta(days=nights),
                guests=2,
                nights=nights,
                nightly_rate=listing.price_per_night,
                cleaning_fee=listing.cleaning_fee,
                service_fee=listing.price_per_night * nights * 0.12,
                total_price=(listing.price_per_night * nights) + listing.cleaning_fee,
                status=BookingStatus.CONFIRMED
            )
            db.add(future_booking)

def run_seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Listing).count() > 0:
            print("Database already seeded with listings. Skipping.")
            return

        print("Starting seed process...")
        image_urls = get_cloudinary_images()
        
        amenity_map = seed_amenities(db)
        users = seed_users(db)
        hosts = [u for u in users if u.role == UserRole.HOST]
        guests = [u for u in users if u.role == UserRole.GUEST]
        
        print("Generating listings...")
        listings = generate_listings(db, hosts, amenity_map, image_urls)
        
        print("Generating bookings and reviews...")
        seed_bookings_and_reviews(db, guests, listings)
        
        db.commit()
        print(f"Successfully seeded {len(users)} users, {len(listings)} listings, and {len(amenity_map)} amenities.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
