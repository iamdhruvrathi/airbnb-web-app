"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookingsApi, reviewsApi } from "@/services";
import { formatPrice } from "@/lib/utils";

interface TripDetailViewProps {
  bookingId: number;
}

export function TripDetailView({ bookingId }: TripDetailViewProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => bookingsApi.getById(bookingId),
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsApi.cancel(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Booking cancelled");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        listing_id: booking!.listing_id,
        booking_id: bookingId,
        rating,
        comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", booking!.listing_id] });
      toast.success("Review submitted!");
      setComment("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />;
  if (isError || !booking) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="font-medium text-red-700">Booking not found</p>
        <Link href="/trips" className="mt-4 inline-block text-[#FF385C] underline">Back to trips</Link>
      </div>
    );
  }

  const canReview = booking.status === "completed" || booking.status === "confirmed";

  return (
    <div className="space-y-8">
      <Link href="/trips" className="text-sm text-neutral-500 hover:underline">← Back to trips</Link>

      <div className="overflow-hidden rounded-2xl border dark:border-neutral-800">
        <div className="relative h-56 md:h-72">
          {booking.listing?.primary_image ? (
            <Image
              src={booking.listing.primary_image}
              alt={booking.listing.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full bg-neutral-200" />
          )}
        </div>
        <div className="space-y-4 p-6">
          <div>
            <h1 className="text-2xl font-semibold">
              {booking.listing?.title ?? `Listing #${booking.listing_id}`}
            </h1>
            <p className="text-neutral-500">
              {format(new Date(booking.check_in), "MMMM d, yyyy")} –{" "}
              {format(new Date(booking.check_out), "MMMM d, yyyy")} · {booking.guests} guest
              {booking.guests > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <span className="rounded-full bg-neutral-100 px-3 py-1 capitalize dark:bg-neutral-800">
              {booking.status}
            </span>
            <span>{booking.nights} nights</span>
          </div>

          <div className="space-y-2 border-t pt-4 dark:border-neutral-800">
            <div className="flex justify-between text-sm">
              <span>Nightly rate × {booking.nights}</span>
              <span>{formatPrice(booking.nightly_rate * booking.nights)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cleaning fee</span>
              <span>{formatPrice(booking.cleaning_fee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Service fee</span>
              <span>{formatPrice(booking.service_fee)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold dark:border-neutral-800">
              <span>Total paid</span>
              <span>{formatPrice(booking.total_price)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href={`/listings/${booking.listing_id}`}>View listing</Link>
            </Button>
            <Button variant="outline" disabled>Message Host (Coming Soon)</Button>
            {booking.status === "confirmed" && (
              <Button
                variant="outline"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                Cancel booking
              </Button>
            )}
          </div>
        </div>
      </div>

      {canReview && (
        <div className="rounded-2xl border p-6 dark:border-neutral-800">
          <h2 className="mb-4 text-xl font-semibold">Leave a review</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="h-10 rounded-lg border px-3 dark:border-neutral-700 dark:bg-neutral-900"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>{n} stars</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full rounded-lg border p-3 dark:border-neutral-700 dark:bg-neutral-900"
                placeholder="Share your experience..."
              />
            </div>
            <Button
              onClick={() => reviewMutation.mutate()}
              disabled={reviewMutation.isPending || comment.length < 10}
            >
              {reviewMutation.isPending ? "Submitting..." : "Submit review"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
