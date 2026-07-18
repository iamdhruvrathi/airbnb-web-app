import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function FallbackImage({ src, alt, className, ...props }: ImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500",
          className
        )}
      >
        <ImageOff className="mb-2 h-8 w-8 opacity-50" />
        <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
