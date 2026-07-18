"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { reviewsApi } from "@/services";

interface ReviewsSectionProps {
  listingId: number;
}

export function ReviewsSection({ listingId }: ReviewsSectionProps) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", listingId],
    queryFn: () => reviewsApi.getByListing(listingId),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-2xl bg-neutral-200" />;
  if (reviews.length === 0) return null;

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Star className="h-5 w-5 fill-current" />
        <h2 className="text-xl font-semibold">{avg.toFixed(2)} · {reviews.length} reviews</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {reviews.slice(0, 6).map((review) => (
          <div key={review.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar>
                {review.author.avatar_url && <AvatarImage src={review.author.avatar_url} alt={review.author.name} />}
                <AvatarFallback>{review.author.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{review.author.name}</p>
                <p className="text-sm text-neutral-500">{format(new Date(review.created_at), "MMMM yyyy")}</p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
