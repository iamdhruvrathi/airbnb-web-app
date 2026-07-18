"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  compact?: boolean;
}

export function SearchBar({ compact = false }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState(searchParams.get("q") ?? searchParams.get("city") ?? "");
  const initCheckIn = searchParams.get("check_in");
  const initCheckOut = searchParams.get("check_out");
  const [date, setDate] = useState<DateRange | undefined>({
    from: initCheckIn ? parseISO(initCheckIn) : undefined,
    to: initCheckOut ? parseISO(initCheckOut) : undefined,
  });
  const [guests, setGuests] = useState(searchParams.get("guests") ?? "1");

  function handleSearch() {
    const params = new URLSearchParams();
    if (location) {
      params.set("q", location);
      params.set("city", location);
    }
    if (date?.from) params.set("check_in", format(date.from, "yyyy-MM-dd"));
    if (date?.to) params.set("check_out", format(date.to, "yyyy-MM-dd"));
    if (guests) params.set("guests", guests);
    router.push(`/?${params.toString()}`);
  }

  if (compact) {
    return (
      <button
        onClick={() => document.getElementById("hero-search")?.scrollIntoView({ behavior: "smooth" })}
        className="flex w-full max-w-md items-center gap-3 rounded-full border border-neutral-300 bg-white px-4 py-2 shadow-sm transition hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
      >
        <Search className="h-4 w-4 text-neutral-500" />
        <span className="truncate text-sm text-neutral-600 dark:text-neutral-300">
          {location || "Anywhere"} · {date?.from && date?.to ? `${format(date.from, "MMM d")} – ${format(date.to, "MMM d")}` : "Any week"} · {guests} guest{Number(guests) > 1 ? "s" : ""}
        </span>
      </button>
    );
  }

  return (
    <div id="hero-search" className={cn("mx-auto w-full max-w-4xl rounded-full border border-neutral-300 bg-white p-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900", compact && "shadow-sm")}>
      <div className="grid gap-2 md:grid-cols-[2fr_2fr_1fr_auto] md:items-center md:gap-0">
        <div className="border-neutral-200 px-4 py-2 md:border-r dark:border-neutral-700">
          <label className="block text-xs font-semibold">Location</label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search destinations"
            className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="border-neutral-200 px-4 py-2 md:border-r dark:border-neutral-700">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full text-left bg-transparent border-0 p-0 flex flex-col justify-center h-full">
                <span className="block text-xs font-semibold">Dates</span>
                <span className="block text-sm text-neutral-500 truncate mt-1">
                  {date?.from ? (
                    date.to ? `${format(date.from, "LLL dd")} - ${format(date.to, "LLL dd")}` : format(date.from, "LLL dd")
                  ) : "Add dates"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="px-4 py-2">
          <label className="block text-xs font-semibold">Guests</label>
          <Input
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Button onClick={handleSearch} className="mx-2 rounded-full px-6">
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search</span>
        </Button>
      </div>
    </div>
  );
}
