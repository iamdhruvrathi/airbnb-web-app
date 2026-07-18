import type {
  Amenity,
  Booking,
  BookingCreatePayload,
  HostDashboard,
  ListingCard,
  ListingCreatePayload,
  ListingDetail,
  ListingSearchParams,
  ListingUpdatePayload,
  PaginatedResponse,
  PriceBreakdown,
  Review,
  ReviewCreatePayload,
  UnavailableRange,
  User,
  WishlistItem,
} from "@/types";
import { apiClient } from "./api-client";

export const authApi = {
  getMe: () => apiClient.get<User>("/auth/me").then((r) => r.data),
  updateMe: (payload: { name?: string; bio?: string; avatar_url?: string }) =>
    apiClient.put<User>("/auth/me", payload).then((r) => r.data),
};

export const listingsApi = {
  search: (params: ListingSearchParams) =>
    apiClient.get<PaginatedResponse<ListingCard>>("/listings", { params }).then((r) => r.data),
  getById: (id: number) => apiClient.get<ListingDetail>(`/listings/${id}`).then((r) => r.data),
  getAvailability: (id: number) =>
    apiClient.get<UnavailableRange[]>(`/listings/${id}/availability`).then((r) => r.data),
  getPrice: (id: number, checkIn: string, checkOut: string) =>
    apiClient
      .get<PriceBreakdown>(`/listings/${id}/price`, { params: { check_in: checkIn, check_out: checkOut } })
      .then((r) => r.data),
  create: (payload: ListingCreatePayload) =>
    apiClient.post<ListingDetail>("/listings", payload).then((r) => r.data),
  update: (id: number, payload: ListingUpdatePayload) =>
    apiClient.put<ListingDetail>(`/listings/${id}`, payload).then((r) => r.data),
  delete: (id: number) => apiClient.delete(`/listings/${id}`),
};

export const amenitiesApi = {
  getAll: () => apiClient.get<Amenity[]>("/amenities").then((r) => r.data),
};

export const bookingsApi = {
  create: (payload: BookingCreatePayload) =>
    apiClient.post<Booking>("/bookings", payload).then((r) => r.data),
  getMyTrips: () => apiClient.get<Booking[]>("/bookings/me").then((r) => r.data),
  getById: (id: number) => apiClient.get<Booking>(`/bookings/${id}`).then((r) => r.data),
  cancel: (id: number) => apiClient.post<Booking>(`/bookings/${id}/cancel`).then((r) => r.data),
  getByListing: (listingId: number) =>
    apiClient.get<Booking[]>(`/host/listings/${listingId}/bookings`).then((r) => r.data),
};

export const reviewsApi = {
  getByListing: (listingId: number) =>
    apiClient.get<Review[]>(`/listings/${listingId}/reviews`).then((r) => r.data),
  create: (payload: ReviewCreatePayload) =>
    apiClient.post<Review>("/reviews", payload).then((r) => r.data),
};

export const wishlistApi = {
  getAll: () => apiClient.get<WishlistItem[]>("/wishlist").then((r) => r.data),
  toggle: (listingId: number) =>
    apiClient.post<{ listing_id: number; is_wishlisted: boolean }>(`/wishlist/${listingId}/toggle`).then((r) => r.data),
};

export const hostApi = {
  getDashboard: () => apiClient.get<HostDashboard>("/host/dashboard").then((r) => r.data),
};
