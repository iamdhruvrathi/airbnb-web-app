"use client";

import Image from "next/image";
import { useState } from "react";
import { Grid2X2, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ListingImage } from "@/types";

interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [showAll, setShowAll] = useState(false);
  const displayImages = images.slice(0, 5);

  if (images.length === 0) {
    return <div className="aspect-[2/1] rounded-2xl bg-neutral-200" />;
  }

  return (
    <>
      <div className="relative hidden h-[420px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:grid">
        <button className="relative col-span-2 row-span-2" onClick={() => setShowAll(true)}>
          <Image src={displayImages[0].url} alt={title} fill className="object-cover" sizes="50vw" />
        </button>
        {displayImages.slice(1, 5).map((image, idx) => (
          <button key={image.id} className="relative" onClick={() => setShowAll(true)}>
            <Image src={image.url} alt={image.alt_text ?? title} fill className="object-cover" sizes="25vw" />
            {idx === 3 && images.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                <Grid2X2 className="mr-2 h-4 w-4" />
                Show all photos
              </div>
            )}
          </button>
        ))}
        {images.length > 1 && (
          <button
            className="absolute bottom-4 right-4 rounded-lg border border-neutral-900 bg-white px-4 py-2 text-sm font-medium dark:border-neutral-100 dark:bg-neutral-950"
            onClick={() => setShowAll(true)}
          >
            Show all photos
          </button>
        )}
      </div>

      <button className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl md:hidden" onClick={() => setShowAll(true)}>
        <Image src={displayImages[0].url} alt={title} fill className="object-cover" sizes="100vw" />
      </button>

      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={image.url} alt={image.alt_text ?? title} fill className="object-cover" sizes="50vw" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
