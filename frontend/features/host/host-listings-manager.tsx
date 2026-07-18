"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { hostApi, listingsApi } from "@/services";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-provider";

export function HostListingsManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["host-dashboard"],
    queryFn: () => hostApi.getDashboard(),
    enabled: user?.role === "host",
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => listingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["host-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success("Listing deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (user?.role !== "host") {
    return <p>Switch to a host user to manage listings.</p>;
  }

  if (isLoading) return <div className="h-32 animate-pulse rounded-2xl bg-neutral-200" />;

  const listings = data?.listings ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Your listings</h1>
        <Button asChild><Link href="/host/listings/new">Create listing</Link></Button>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <p className="text-neutral-500">No listings yet</p>
          <Button asChild className="mt-4"><Link href="/host/listings/new">Create your first listing</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 dark:border-neutral-800">
              <div>
                <p className="font-semibold">{listing.title}</p>
                <p className="text-sm text-neutral-500">{listing.city}, {listing.country}</p>
                <p className="mt-1 font-medium">{formatPrice(listing.price_per_night)}/night</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/host/listings/${listing.id}/edit`}><Pencil className="h-4 w-4" /> Edit</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Delete this listing?")) deleteMutation.mutate(listing.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
