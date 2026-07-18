import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryRow } from "@/features/home/category-row";
import { SearchBar } from "@/features/search/search-bar";
import { ListingGrid } from "@/features/listings/listing-grid";
import { ListingGridSkeleton } from "@/features/listings/listing-skeleton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airbnb Clone — Find your next stay",
  description: "Browse and book unique homes, apartments, and experiences worldwide.",
};

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-b from-[#FF385C]/5 to-transparent px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-7xl space-y-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Find your next stay
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Discover unique homes and experiences around the world
          </p>
          <Suspense fallback={<div className="h-16" />}>
            <SearchBar />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={<div className="h-16" />}>
        <CategoryRow />
      </Suspense>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Suspense fallback={<ListingGridSkeleton />}>
          <ListingGrid />
        </Suspense>
      </section>
    </>
  );
}
