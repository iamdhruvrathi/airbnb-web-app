"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/auth-provider";
import { wishlistApi } from "@/services";
import { formatPrice, formatRating } from "@/lib/utils";
import type { ListingCard } from "@/types";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: ListingCard;
}

export function ListingCardItem({ listing }: ListingCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () => wishlistApi.toggle(listing.id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(data.is_wishlisted ? "Added to wishlist" : "Removed from wishlist");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-neutral-200">
        {listing.primary_image ? (
          <Image
            src={listing.primary_image}
            alt={listing.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">No image</div>
        )}
        <button
          className="absolute right-3 top-3 rounded-full p-2 hover:scale-110"
          onClick={(e) => {
            e.preventDefault();
            if (!user) {
              toast.error("Please select a user to save listings");
              return;
            }
            toggleMutation.mutate();
          }}
          aria-label="Toggle wishlist"
        >
          <Heart
            className={cn(
              "h-5 w-5 drop-shadow",
              listing.is_wishlisted ? "fill-[#FF385C] text-[#FF385C]" : "fill-black/50 text-white"
            )}
          />
        </button>
      </div>
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{listing.city}, {listing.country}</h3>
          {listing.average_rating && (
            <div className="flex shrink-0 items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-current" />
              {formatRating(listing.average_rating)}
            </div>
          )}
        </div>
        <p className="line-clamp-1 text-sm text-neutral-500">{listing.title}</p>
        <p className="text-sm text-neutral-500">
          {listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""} · {listing.beds} bed · {listing.bathrooms} bath
        </p>
        <p className="pt-1">
          <span className="font-semibold">{formatPrice(listing.price_per_night)}</span>
          <span className="text-neutral-500"> night</span>
        </p>
      </div>
    </Link>
  );
}
