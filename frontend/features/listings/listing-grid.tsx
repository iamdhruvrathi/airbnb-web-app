"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
    amenity_ids: searchParams.get("amenity_ids") ? searchParams.get("amenity_ids")!.split(",").map(Number) : undefined,
    min_bedrooms: searchParams.get("min_bedrooms") ? Number(searchParams.get("min_bedrooms")) : undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["listings", params],
    queryFn: () => listingsApi.search(params),
  });

  if (isLoading) return <ListingGridSkeleton />;
  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
        <p className="font-medium text-red-700 dark:text-red-300">Failed to load listings</p>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{(error as Error).message}</p>
      </div>
    );
  }

  const listings = data?.items ?? [];
  const meta = data?.meta;

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

      {meta && meta.total_pages > 1 && (
        <Pagination currentPage={meta.page} totalPages={meta.total_pages} />
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const searchParams = useSearchParams();

  function pageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `/?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      {currentPage > 1 && (
        <Button variant="outline" asChild>
          <a href={pageUrl(currentPage - 1)}>Previous</a>
        </Button>
      )}
      <span className="px-4 text-sm text-neutral-500">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <Button variant="outline" asChild>
          <a href={pageUrl(currentPage + 1)}>Next</a>
        </Button>
      )}
    </div>
  );
}
