import { MapPin, Map as MapIcon } from "lucide-react";

interface StaticMapProps {
  latitude: number;
  longitude: number;
  city: string;
}

export function StaticMap({ latitude, longitude, city }: StaticMapProps) {
  return (
    <div className="relative flex h-64 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-800">
          <MapIcon className="h-6 w-6 text-neutral-400" />
        </div>
        <div>
          <p className="font-semibold text-neutral-700 dark:text-neutral-300">Map view for {city}</p>
          <p className="text-sm text-neutral-500">Interactive maps coming soon</p>
        </div>
      </div>
    </div>
  );
}
