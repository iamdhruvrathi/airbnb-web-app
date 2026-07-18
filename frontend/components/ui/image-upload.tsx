import { useCallback, useState } from "react";
import { UploadCloud, X, Loader2, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/api-client";

interface UploadedImage {
  url: string;
  public_id?: string;
  alt_text?: string;
}

interface ImageUploadProps {
  value: UploadedImage[];
  onChange: (value: UploadedImage[]) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await apiClient.post("/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newImages = res.data.images as UploadedImage[];
      onChange([...value, ...newImages]);
      toast.success("Images uploaded successfully");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      // Reset input
      if (e.target) {
        e.target.value = "";
      }
    }
  }, [value, onChange]);

  const handleRemove = (index: number) => {
    const newValues = [...value];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const newValues = [...value];
    const temp = newValues[index - 1];
    newValues[index - 1] = newValues[index];
    newValues[index] = temp;
    onChange(newValues);
  };

  const handleMoveRight = (index: number) => {
    if (index === value.length - 1) return;
    const newValues = [...value];
    const temp = newValues[index + 1];
    newValues[index + 1] = newValues[index];
    newValues[index] = temp;
    onChange(newValues);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const newValues = [...value];
    const item = newValues.splice(index, 1)[0];
    newValues.unshift(item);
    onChange(newValues);
  };

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {value.map((img, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Uploaded preview" className="h-full w-full object-cover" />
              {index === 0 && (
                <div className="absolute left-2 top-2 rounded-md bg-white px-2 py-1 text-xs font-semibold text-black shadow-sm">
                  Cover Photo
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-rose-500 transition"
              >
                <X className="h-4 w-4" />
              </button>

              {value.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/60 px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleMoveLeft(index)}
                    disabled={index === 0 || disabled}
                    className="p-1 text-white disabled:opacity-30 hover:text-rose-400 transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMakeCover(index)}
                    disabled={index === 0 || disabled}
                    className="p-1 text-white disabled:opacity-30 hover:text-rose-400 transition"
                    title="Make cover photo"
                  >
                    <Star className={cn("h-4 w-4", index === 0 && "fill-white text-white")} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveRight(index)}
                    disabled={index === value.length - 1 || disabled}
                    className="p-1 text-white disabled:opacity-30 hover:text-rose-400 transition"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900",
          (disabled || isUploading) && "pointer-events-none opacity-50"
        )}
      >
        {isUploading ? (
          <Loader2 className="h-10 w-10 animate-spin text-neutral-500" />
        ) : (
          <UploadCloud className="h-10 w-10 text-neutral-500" />
        )}
        <span className="mt-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
          {isUploading ? "Uploading..." : "Click or drag images to upload"}
        </span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={disabled || isUploading}
        />
      </label>
    </div>
  );
}
