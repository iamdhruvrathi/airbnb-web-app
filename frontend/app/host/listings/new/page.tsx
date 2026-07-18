import { ListingForm } from "@/features/host/listing-form";

export const metadata = { title: "Create Listing" };

export default function NewListingPage() {
  return (
    <div className="px-4 py-8 md:px-6">
      <ListingForm />
    </div>
  );
}
