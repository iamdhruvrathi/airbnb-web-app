import { ListingDetailView } from "@/features/listings/listing-detail-view";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ListingPageProps) {
  const { id } = await params;
  return { title: `Listing #${id}` };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <ListingDetailView listingId={Number(id)} />
    </div>
  );
}
