import { TripDetailView } from "@/features/booking/trip-detail-view";

interface TripPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TripPageProps) {
  const { id } = await params;
  return { title: `Trip #${id}` };
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <TripDetailView bookingId={Number(id)} />
    </div>
  );
}
