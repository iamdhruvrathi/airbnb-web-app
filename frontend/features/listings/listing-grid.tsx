"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ListingCardItem } from "@/features/listings/listing-card";
import { ListingGridSkeleton } from "@/features/listings/listing-skeleton";
import { FilterPanel } from "@/features/search/filter-panel";
import { listingsApi } from "@/services";
import type { ListingSearchParams, PropertyType } from "@/types";
import { Button } from "@/components/ui/button";

export function ListingGrid() {
  const searchParams = useSearchParams();

  const params: ListingSearchParams = {
    q: searchParams.get("q") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    check_in: searchParams.get("check_in") ?? undefined,
    check_out: searchParams.get("check_out") ?? undefined,
    guests: searchParams.get("guests") ? Number(searchParams.get("guests")) : undefined,
    min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined,
    max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined,
    property_type: (searchParams.get("property_type") as PropertyType) ?? undefined,
    amenity_ids: searchParams.get("amenity_ids") ?? undefined,
    min_bedrooms: searchParams.get("min_bedrooms") ? Number(searchParams.get("min_bedrooms")) : undefined,
  };

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["listings", params],
    queryFn: ({ pageParam = 1 }) => listingsApi.search({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.total_pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    }
  });

  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = observerRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <ListingGridSkeleton />;
  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
        <p className="font-medium text-red-700 dark:text-red-300">Failed to load listings</p>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{(error as Error).message}</p>
      </div>
    );
  }

  const listings = data?.pages.flatMap((page) => page.items) ?? [];
  const meta = data?.pages[0]?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {meta?.total ? `${meta.total} stays` : "Explore stays"}
          </h2>
          {params.city && <p className="text-neutral-500">in {params.city}</p>}
        </div>
        <FilterPanel />
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-16 text-center dark:border-neutral-700">
          <p className="text-lg font-medium">No listings found</p>
          <p className="mt-2 text-neutral-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCardItem key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div ref={observerRef} className="flex justify-center pt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading more..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
