"use client";

import { useQuery } from "@tanstack/react-query";
import { ListingForm } from "@/features/host/listing-form";
import { listingsApi } from "@/services";

interface EditListingPageProps {
  listingId: number;
}

export function EditListingPageClient({ listingId }: EditListingPageProps) {
  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => listingsApi.getById(listingId),
  });

  if (isLoading) return <div className="mx-auto h-64 max-w-2xl animate-pulse rounded-2xl bg-neutral-200" />;
  if (isError || !listing) return <p className="text-red-600">Listing not found</p>;

  return (
    <div className="px-4 py-8 md:px-6">
      <ListingForm
        listingId={listingId}
        defaultValues={{
          title: listing.title,
          description: listing.description,
          property_type: listing.property_type,
          city: listing.city,
          country: listing.country,
          address: listing.address,
          latitude: listing.latitude,
          longitude: listing.longitude,
          price_per_night: listing.price_per_night,
          cleaning_fee: listing.cleaning_fee,
          service_fee_percent: listing.service_fee_percent,
          max_guests: listing.max_guests,
          bedrooms: listing.bedrooms,
          beds: listing.beds,
          bathrooms: listing.bathrooms,
          image_url: listing.images[0]?.url ?? "",
          amenity_ids: listing.amenities.map((a) => a.id),
        }}
      />
    </div>
  );
}
