import { EditListingPageClient } from "@/features/host/edit-listing-page";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditListingPageProps) {
  const { id } = await params;
  return { title: `Edit Listing #${id}` };
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  return <EditListingPageClient listingId={Number(id)} />;
}
