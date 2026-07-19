"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { amenitiesApi, listingsApi } from "@/services";
import type { ListingCreatePayload, PropertyType } from "@/types";
import { useAuth } from "@/features/auth/auth-provider";
import { ImageUpload } from "@/components/ui/image-upload";

const listingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  property_type: z.string(),
  city: z.string().min(2),
  country: z.string().min(2),
  address: z.string().min(5),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  price_per_night: z.coerce.number().positive(),
  cleaning_fee: z.coerce.number().min(0).default(0),
  service_fee_percent: z.coerce.number().min(0).max(100).default(12),
  max_guests: z.coerce.number().min(1).max(20),
  bedrooms: z.coerce.number().min(0).max(20),
  beds: z.coerce.number().min(1).max(20),
  bathrooms: z.coerce.number().min(0.5).max(20),
  images: z.array(z.object({
    url: z.string().url(),
    public_id: z.string().optional(),
    alt_text: z.string().optional()
  })).min(1, "At least one image is required"),
  amenity_ids: z.array(z.number()).default([]),
});

type ListingFormValues = z.infer<typeof listingSchema>;

interface ListingFormProps {
  listingId?: number;
  defaultValues?: Partial<ListingFormValues>;
}

export function ListingForm({ listingId, defaultValues }: ListingFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const isEdit = Boolean(listingId);

  const { data: amenities = [] } = useQuery({
    queryKey: ["amenities"],
    queryFn: () => amenitiesApi.getAll(),
  });

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema) as any,
    defaultValues: {
      property_type: "apartment",
      cleaning_fee: 0,
      service_fee_percent: 12,
      max_guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      latitude: 40.7128,
      longitude: -74.006,
      images: [],
      amenity_ids: [],
      ...defaultValues,
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: ListingCreatePayload) =>
      isEdit ? listingsApi.update(listingId!, payload) : listingsApi.create(payload),
    onSuccess: (listing) => {
      toast.success(isEdit ? "Listing updated" : "Listing created");
      router.push(`/listings/${listing.id}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function onSubmit(values: ListingFormValues) {
    if (!user) {
      toast.error("Please sign in to create a listing");
      return;
    }

    const payload: ListingCreatePayload = {
      title: values.title,
      description: values.description,
      property_type: values.property_type as PropertyType,
      city: values.city,
      country: values.country,
      address: values.address,
      latitude: values.latitude,
      longitude: values.longitude,
      price_per_night: values.price_per_night,
      cleaning_fee: values.cleaning_fee,
      service_fee_percent: values.service_fee_percent,
      max_guests: values.max_guests,
      bedrooms: values.bedrooms,
      beds: values.beds,
      bathrooms: values.bathrooms,
      images: values.images.map((img, i) => ({ ...img, sort_order: i, alt_text: img.alt_text || values.title })),
      amenity_ids: values.amenity_ids,
    };

    createMutation.mutate(payload);
  }

  const selectedAmenities = form.watch("amenity_ids") ?? [];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold">{isEdit ? "Edit listing" : "Create a listing"}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Title"><Input {...form.register("title")} /></Field>
        <Field label="Property type">
          <select {...form.register("property_type")} className="h-10 w-full rounded-lg border px-3 dark:border-neutral-700 dark:bg-neutral-900">
            {["apartment", "house", "villa", "cabin", "loft", "studio", "townhouse", "beach_house"].map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea {...form.register("description")} rows={4} className="w-full rounded-lg border p-3 dark:border-neutral-700 dark:bg-neutral-900" />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="City"><Input {...form.register("city")} /></Field>
        <Field label="Country"><Input {...form.register("country")} /></Field>
        <Field label="Address"><Input {...form.register("address")} /></Field>
      </div>

      <Field label="Images">
        <ImageUpload
          value={form.watch("images") || []}
          onChange={(val) => form.setValue("images", val, { shouldValidate: true })}
        />
        {form.formState.errors.images && (
          <p className="text-sm text-red-500">{form.formState.errors.images.message}</p>
        )}
      </Field>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Price/night"><Input type="number" {...form.register("price_per_night")} /></Field>
        <Field label="Cleaning fee"><Input type="number" {...form.register("cleaning_fee")} /></Field>
        <Field label="Max guests"><Input type="number" {...form.register("max_guests")} /></Field>
        <Field label="Bedrooms"><Input type="number" {...form.register("bedrooms")} /></Field>
        <Field label="Beds"><Input type="number" {...form.register("beds")} /></Field>
        <Field label="Bathrooms"><Input type="number" step="0.5" {...form.register("bathrooms")} /></Field>
      </div>

      <div>
        <p className="mb-2 font-medium">Amenities</p>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity) => {
            const selected = selectedAmenities.includes(amenity.id);
            return (
              <button
                key={amenity.id}
                type="button"
                className={`rounded-full border px-3 py-1 text-sm ${selected ? "border-[#FF385C] bg-[#FF385C]/10" : "border-neutral-300 dark:border-neutral-700"}`}
                onClick={() => {
                  const next = selected
                    ? selectedAmenities.filter((id) => id !== amenity.id)
                    : [...selectedAmenities, amenity.id];
                  form.setValue("amenity_ids", next);
                }}
              >
                {amenity.name}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={createMutation.isPending} className="w-full sm:w-auto bg-[#FF385C] hover:bg-[#D70466] text-white rounded-full px-8 font-semibold shadow-md">
        {createMutation.isPending ? "Saving..." : isEdit ? "Update listing" : "Create listing"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
