"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bookingsApi } from "@/services";
import { formatPrice } from "@/lib/utils";

export function TripsView() {
  const queryClient = useQueryClient();

  const { data: trips = [], isLoading, isError } = useQuery({
    queryKey: ["trips"],
    queryFn: () => bookingsApi.getMyTrips(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => bookingsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Booking cancelled");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />;
  if (isError) return <p className="text-red-600">Failed to load trips. Select a user from the menu.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">My Trips</h1>
      {trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No trips booked yet</p>
          <Link href="/" className="mt-4 inline-block text-[#FF385C] underline">Start searching</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="flex flex-col gap-4 rounded-2xl border p-4 md:flex-row dark:border-neutral-800">
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl md:h-32 md:w-48">
                {trip.listing?.primary_image ? (
                  <Image src={trip.listing.primary_image} alt={trip.listing.title} fill className="object-cover" />
                ) : (
                  <div className="h-full bg-neutral-200" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div>
                  <Link href={`/listings/${trip.listing_id}`} className="text-lg font-semibold hover:underline">
                    {trip.listing?.title ?? `Listing #${trip.listing_id}`}
                  </Link>
                  <p className="text-neutral-500">
                    {format(new Date(trip.check_in), "MMM d")} – {format(new Date(trip.check_out), "MMM d, yyyy")} · {trip.guests} guests
                  </p>
                  <p className="mt-1 capitalize text-sm text-neutral-500">Status: {trip.status}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold">{formatPrice(trip.total_price)}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/trips/${trip.id}`}>View details</Link>
                  </Button>
                  {trip.status === "confirmed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelMutation.mutate(trip.id)}
                      disabled={cancelMutation.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
