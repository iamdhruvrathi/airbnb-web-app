export type UserRole = "guest" | "host";

export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "cabin"
  | "loft"
  | "studio"
  | "townhouse"
  | "beach_house";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  is_superhost: boolean;
  bio: string | null;
  created_at: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon: string;
  category: string;
}

export interface ListingImage {
  id: number;
  url: string;
  alt_text: string | null;
  sort_order: number;
  public_id?: string | null;
}

export interface HostSummary {
  id: number;
  name: string;
  avatar_url: string | null;
  is_superhost: boolean;
  bio: string | null;
}

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  country: string;
  property_type: PropertyType;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  primary_image: string | null;
  average_rating: number | null;
  review_count: number;
  is_wishlisted: boolean;
}

export interface ListingDetail extends ListingCard {
  host_id: number;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  cleaning_fee: number;
  service_fee_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  host: HostSummary;
  images: ListingImage[];
  amenities: Amenity[];
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PriceBreakdown {
  nightly_rate: number;
  nights: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_rate: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  listing?: ListingCard | null;
}

export interface Review {
  id: number;
  listing_id: number;
  author_id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: HostSummary;
}

export interface WishlistItem {
  id: number;
  listing_id: number;
  created_at: string;
  listing: ListingCard;
}

export interface HostDashboardStats {
  total_listings: number;
  active_listings: number;
  total_bookings: number;
  total_earnings: number;
  average_rating: number | null;
}

export interface HostDashboard {
  stats: HostDashboardStats;
  listings: ListingCard[];
  recent_bookings: Booking[];
}

export interface ListingSearchParams {
  q?: string;
  city?: string;
  country?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: PropertyType;
  amenity_ids?: string;
  min_bedrooms?: number;
  page?: number;
  page_size?: number;
}

export interface UnavailableRange {
  check_in: string;
  check_out: string;
}

export interface ListingCreatePayload {
  title: string;
  description: string;
  property_type: PropertyType;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  cleaning_fee: number;
  service_fee_percent: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  images: { url: string; alt_text?: string; sort_order?: number; public_id?: string }[];
  amenity_ids: number[];
}

export type ListingUpdatePayload = Partial<ListingCreatePayload> & { is_active?: boolean };

export interface BookingCreatePayload {
  listing_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}

export interface ReviewCreatePayload {
  listing_id: number;
  booking_id?: number;
  rating: number;
  comment: string;
}

export const CATEGORIES = [
  { id: "all", label: "All", icon: "🏠" },
  { id: "beach_house", label: "Beach", icon: "🏖️" },
  { id: "cabin", label: "Cabins", icon: "🌲" },
  { id: "villa", label: "Villas", icon: "🏡" },
  { id: "apartment", label: "Apartments", icon: "🏢" },
  { id: "loft", label: "Lofts", icon: "🌆" },
  { id: "house", label: "Houses", icon: "🏠" },
  { id: "studio", label: "Studios", icon: "🎨" },
] as const;
