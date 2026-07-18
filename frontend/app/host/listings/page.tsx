import { HostListingsManager } from "@/features/host/host-listings-manager";

export const metadata = { title: "Manage Listings" };

export default function HostListingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <HostListingsManager />
    </div>
  );
}
