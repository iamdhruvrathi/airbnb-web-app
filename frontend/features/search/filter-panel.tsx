"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useQuery } from "@tanstack/react-query";
import { amenitiesApi } from "@/services";

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");
  const [minBedrooms, setMinBedrooms] = useState(searchParams.get("min_bedrooms") ?? "");
  const [amenityIds, setAmenityIds] = useState<number[]>(
    searchParams.get("amenity_ids") ? searchParams.get("amenity_ids")!.split(",").map(Number) : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") ?? "");
  const [open, setOpen] = useState(false);

  const { data: amenities = [] } = useQuery({
    queryKey: ["amenities"],
    queryFn: () => amenitiesApi.getAll(),
  });

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("min_price", minPrice);
    else params.delete("min_price");
    if (maxPrice) params.set("max_price", maxPrice);
    else params.delete("max_price");
    if (minBedrooms) params.set("min_bedrooms", minBedrooms);
    else params.delete("min_bedrooms");
    if (amenityIds.length > 0) params.set("amenity_ids", amenityIds.join(","));
    else params.delete("amenity_ids");
    if (sortBy) params.set("sort_by", sortBy);
    else params.delete("sort_by");
    params.delete("page");
    router.push(`/?${params.toString()}`);
    setOpen(false);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("min_price");
    params.delete("max_price");
    params.delete("min_bedrooms");
    params.delete("amenity_ids");
    params.delete("sort_by");
    params.delete("page");
    router.push(`/?${params.toString()}`);
    setMinPrice("");
    setMaxPrice("");
    setMinBedrooms("");
    setAmenityIds([]);
    setSortBy("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Min price</label>
            <Input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Max price</label>
            <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="1000" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Min bedrooms</label>
            <Input type="number" value={minBedrooms} onChange={(e) => setMinBedrooms(e.target.value)} placeholder="1" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity) => {
                const selected = amenityIds.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    className={`rounded-full border px-3 py-1 text-sm ${selected ? "border-[#FF385C] bg-[#FF385C]/10" : "border-neutral-300 dark:border-neutral-700"}`}
                    onClick={() => {
                      const next = selected
                        ? amenityIds.filter((id) => id !== amenity.id)
                        : [...amenityIds, amenity.id];
                      setAmenityIds(next);
                    }}
                  >
                    {amenity.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Sort by</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="sort_by"
                  value=""
                  checked={sortBy === ""}
                  onChange={() => setSortBy("")}
                  className="accent-[#FF385C]"
                />
                Newest (Default)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="sort_by"
                  value="price_asc"
                  checked={sortBy === "price_asc"}
                  onChange={() => setSortBy("price_asc")}
                  className="accent-[#FF385C]"
                />
                Price: Low to High
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="sort_by"
                  value="price_desc"
                  checked={sortBy === "price_desc"}
                  onChange={() => setSortBy("price_desc")}
                  className="accent-[#FF385C]"
                />
                Price: High to Low
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={applyFilters} className="flex-1">Apply</Button>
            <Button variant="outline" onClick={clearFilters}>Clear</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
