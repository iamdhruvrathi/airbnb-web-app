"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingGallery } from "@/features/listings/listing-gallery";
import { BookingWidget } from "@/features/booking/booking-widget";
import { ReviewsSection } from "@/features/listings/reviews-section";
import { listingsApi } from "@/services";
import { formatPrice, formatRating, propertyTypeLabel } from "@/lib/utils";
import { StaticMap } from "@/components/ui/static-map";

interface ListingDetailViewProps {
  listingId: number;
}

export function ListingDetailView({ listingId }: ListingDetailViewProps) {
  const { data: listing, isLoading, isError, error } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => listingsApi.getById(listingId),
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-6"><div className="h-[420px] rounded-2xl bg-neutral-200" /><div className="h-8 w-1/2 rounded bg-neutral-200" /></div>;
  }

  if (isError || !listing) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-medium text-red-700">Listing not found</p>
        <p className="mt-2 text-sm text-red-600">{(error as Error)?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ListingGallery images={listing.images} title={listing.title} />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold md:text-3xl">{listing.title}</h1>
                <p className="mt-1 text-neutral-500">
                  {listing.city}, {listing.country} · {propertyTypeLabel(listing.property_type)}
                </p>
              </div>
              {listing.average_rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">{formatRating(listing.average_rating)}</span>
                  <span className="text-neutral-500">({listing.review_count} reviews)</span>
                </div>
              )}
            </div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} baths
            </p>
          </div>

          <div className="flex items-center gap-4 border-y border-neutral-200 py-6 dark:border-neutral-800">
            <Avatar className="h-14 w-14">
              {listing.host.avatar_url && <AvatarImage src={listing.host.avatar_url} alt={listing.host.name} />}
              <AvatarFallback>{listing.host.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Hosted by {listing.host.name}</p>
              {listing.host.is_superhost && <Badge className="mt-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900">Superhost</Badge>}
              {listing.host.bio && <p className="mt-1 text-sm text-neutral-500">{listing.host.bio}</p>}
              <Button variant="outline" className="mt-4" disabled>Message Host (Coming Soon)</Button>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold">About this place</h2>
            <p className="leading-relaxed text-neutral-600 dark:text-neutral-400">{listing.description}</p>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">What this place offers</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {listing.amenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                  <span className="text-lg">✓</span>
                  {amenity.name}
                </div>
              ))}
            </div>
          </div>

          <ReviewsSection listingId={listing.id} />

          <div>
            <h2 className="mb-4 text-xl font-semibold">Where you&apos;ll be</h2>
            <StaticMap latitude={listing.latitude} longitude={listing.longitude} city={listing.city} />
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">{listing.address}</p>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingWidget listing={listing} />
        </div>
      </div>
    </div>
  );
}
