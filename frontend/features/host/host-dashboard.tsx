"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DollarSign, Home, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingCardItem } from "@/features/listings/listing-card";
import { hostApi } from "@/services";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-provider";

export function HostDashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["host-dashboard"],
    queryFn: () => hostApi.getDashboard(),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="rounded-2xl border border-dashed p-12 text-center">
        <p className="text-lg font-medium">Authentication required</p>
        <p className="mt-2 text-neutral-500">Sign in to manage your listings.</p>
      </div>
    );
  }

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-neutral-200" />;
  if (isError || !data) return <p className="text-red-600">Failed to load dashboard</p>;

  const stats = [
    { label: "Listings", value: data.stats.total_listings, icon: Home },
    { label: "Active", value: data.stats.active_listings, icon: Home },
    { label: "Bookings", value: data.stats.total_bookings, icon: Users },
    { label: "Earnings", value: formatPrice(data.stats.total_earnings), icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Host Dashboard</h1>
          <p className="text-neutral-500">Manage your listings and bookings</p>
        </div>
        <Button asChild className="bg-[#FF385C] hover:bg-[#D70466] text-white shadow-md rounded-full px-6 font-semibold">
          <Link href="/host/listings/new">Create listing</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-neutral-100 p-3 dark:bg-neutral-800">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.stats.average_rating && (
        <div className="flex items-center gap-2 text-neutral-600">
          <Star className="h-4 w-4 fill-current" />
          Average rating: {data.stats.average_rating}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your listings</h2>
          <Link href="/host/listings" className="text-sm font-medium underline">Manage all</Link>
        </div>
        {data.listings.length === 0 ? (
          <p className="text-neutral-500">No listings yet. Create your first one!</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.listings.slice(0, 3).map((listing) => (
              <ListingCardItem key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Recent bookings</h2>
        {data.recent_bookings.length === 0 ? (
          <p className="text-neutral-500">No bookings yet</p>
        ) : (
          <div className="space-y-3">
            {data.recent_bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{booking.listing?.title ?? `Listing #${booking.listing_id}`}</p>
                    <p className="text-sm text-neutral-500">
                      {format(new Date(booking.check_in), "MMM d")} – {format(new Date(booking.check_out), "MMM d, yyyy")} · {booking.guests} guests
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(booking.total_price)}</p>
                    <p className="text-sm capitalize text-neutral-500">{booking.status}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
