import { TripsView } from "@/features/booking/trips-view";

export const metadata = { title: "My Trips" };

export default function TripsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <TripsView />
    </div>
  );
}
