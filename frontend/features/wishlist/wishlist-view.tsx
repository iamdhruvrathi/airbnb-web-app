"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { ListingCardItem } from "@/features/listings/listing-card";
import { wishlistApi } from "@/services";

export function WishlistView() {
  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.getAll(),
  });

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />;
  if (isError) return <p className="text-red-600">Failed to load wishlist. Make sure you are logged in.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Wishlist</h1>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <p className="text-lg font-medium">No saved listings yet</p>
          <p className="mt-2 text-neutral-500">Start exploring and save your favorites</p>
          <Link href="/" className="mt-4 inline-block text-[#FF385C] underline">Explore stays</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ListingCardItem key={item.id} listing={item.listing} />
          ))}
        </div>
      )}
    </div>
  );
}
