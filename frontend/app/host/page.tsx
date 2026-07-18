import { HostDashboard } from "@/features/host/host-dashboard";

export const metadata = { title: "Host Dashboard" };

export default function HostPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <HostDashboard />
    </div>
  );
}
