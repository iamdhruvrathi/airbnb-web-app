interface StaticMapProps {
  latitude: number;
  longitude: number;
  city: string;
}

export function StaticMap({ latitude, longitude, city }: StaticMapProps) {
  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=13&size=800x400&markers=${latitude},${longitude},red-pushpin`;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mapUrl}
        alt={`Map showing location in ${city}`}
        className="h-64 w-full object-cover"
      />
    </div>
  );
}
