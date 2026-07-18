"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInDays, format, parseISO, isValid } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/auth-provider";
import { bookingsApi, listingsApi } from "@/services";
import { formatPrice } from "@/lib/utils";
import type { ListingDetail } from "@/types";

interface BookingWidgetProps {
  listing: ListingDetail;
}

export function BookingWidget({ listing }: BookingWidgetProps) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [date, setDate] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);

  const checkIn = date?.from && isValid(date.from) ? format(date.from, "yyyy-MM-dd") : "";
  const checkOut = date?.to && isValid(date.to) ? format(date.to, "yyyy-MM-dd") : "";

  const { data: unavailable = [] } = useQuery({
    queryKey: ["availability", listing.id],
    queryFn: () => listingsApi.getAvailability(listing.id),
  });

  const { data: priceBreakdown } = useQuery({
    queryKey: ["price", listing.id, checkIn, checkOut],
    queryFn: () => listingsApi.getPrice(listing.id, checkIn, checkOut),
    enabled: Boolean(checkIn && checkOut && checkOut > checkIn),
  });

  const bookingMutation = useMutation({
    mutationFn: () =>
      bookingsApi.create({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      }),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ["availability", listing.id] });
      toast.success("Booking confirmed!");
      setShowCheckout(false);
      router.push(`/trips/${booking.id}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function isDateUnavailable(dateStr: string): boolean {
    if (!dateStr) return false;
    const date = parseISO(dateStr);
    if (!isValid(date)) return false;
    return unavailable.some((range) => {
      const start = parseISO(range.check_in);
      const end = parseISO(range.check_out);
      if (!isValid(start) || !isValid(end)) return false;
      return date > start && date < end;
    });
  }

  const isOverlap = unavailable.some((range) => {
    if (!checkIn || !checkOut) return false;
    const start = parseISO(range.check_in);
    const end = parseISO(range.check_out);
    const myStart = parseISO(checkIn);
    const myEnd = parseISO(checkOut);
    if (!isValid(start) || !isValid(end) || !isValid(myStart) || !isValid(myEnd)) return false;
    return myStart < end && myEnd > start;
  });

  const parsedCheckIn = checkIn ? parseISO(checkIn) : null;
  const parsedCheckOut = checkOut ? parseISO(checkOut) : null;
  const nights = parsedCheckIn && parsedCheckOut && isValid(parsedCheckIn) && isValid(parsedCheckOut)
    ? differenceInDays(parsedCheckOut, parsedCheckIn)
    : 0;
  const isValidSelection = nights > 0 && guests >= 1 && guests <= listing.max_guests && !isOverlap;

  function formatSafeDate(dateStr: string, fmt: string) {
    if (!dateStr) return "TBD";
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, fmt) : "TBD";
  }

  return (
    <>
      <Card className="shadow-xl">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold">{formatPrice(listing.price_per_night)}</span>
            <span className="text-neutral-500">night</span>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-300 dark:border-neutral-700">
            <div className="border-b border-neutral-300 dark:border-neutral-700">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex w-full cursor-pointer divide-x divide-neutral-300 dark:divide-neutral-700">
                    <button className="flex-1 px-4 py-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-900">
                      <div className="text-[10px] font-bold uppercase tracking-wider">
                        Check-in
                      </div>
                      <div className="text-sm text-neutral-500">
                        {date?.from && isValid(date.from) ? format(date.from, "M/d/yyyy") : "Add date"}
                      </div>
                    </button>
                    <button className="flex-1 px-4 py-3 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-900">
                      <div className="text-[10px] font-bold uppercase tracking-wider">
                        Checkout
                      </div>
                      <div className="text-sm text-neutral-500">
                        {date?.to && isValid(date.to) ? format(date.to, "M/d/yyyy") : "Add date"}
                      </div>
                    </button>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    disabled={(day) => (isValid(day) ? isDateUnavailable(format(day, "yyyy-MM-dd")) : false) || day < new Date(new Date().setHours(0,0,0,0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="p-3">
              <label className="block text-xs font-semibold uppercase">Guests</label>
              <Input
                type="number"
                min={1}
                max={listing.max_guests}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="border-0 p-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          {isOverlap ? (
            <p className="text-sm text-red-600">Selected dates include unavailable nights</p>
          ) : null}

          <Button
            className="w-full rounded-lg"
            size="lg"
            disabled={!isValidSelection || !user}
            onClick={() => setShowCheckout(true)}
          >
            {user ? "Reserve" : "Select a user to book"}
          </Button>
          <p className="text-center text-sm text-neutral-500">You won&apos;t be charged yet</p>

          {priceBreakdown && (
            <div className="space-y-2 border-t border-neutral-200 pt-4 text-sm dark:border-neutral-800">
              <div className="flex justify-between">
                <span>{formatPrice(priceBreakdown.nightly_rate)} × {priceBreakdown.nights} nights</span>
                <span>{formatPrice(priceBreakdown.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleaning fee</span>
                <span>{formatPrice(priceBreakdown.cleaning_fee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>{formatPrice(priceBreakdown.service_fee)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold dark:border-neutral-800">
                <span>Total</span>
                <span>{formatPrice(priceBreakdown.total)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-neutral-600 dark:text-neutral-400">
              {listing.title} · {formatSafeDate(checkIn, "MMM d")} – {formatSafeDate(checkOut, "MMM d")} · {guests} guest{guests > 1 ? "s" : ""}
            </p>
            {priceBreakdown && (
              <p className="text-2xl font-semibold">Total: {formatPrice(priceBreakdown.total)}</p>
            )}
            <p className="rounded-lg bg-neutral-100 p-3 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
              This is a mock checkout. No real payment will be processed.
            </p>
            <Button
              className="w-full"
              size="lg"
              onClick={() => bookingMutation.mutate()}
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? "Processing..." : "Confirm booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
