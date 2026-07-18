"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";

export function CategoryRow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("property_type") ?? "all";

  function selectCategory(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") {
      params.delete("property_type");
    } else {
      params.set("property_type", id);
    }
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-4 md:px-6">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => selectCategory(category.id)}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1 border-b-2 pb-3 text-sm opacity-70 transition hover:opacity-100",
              active === category.id ? "border-neutral-900 opacity-100 dark:border-neutral-100" : "border-transparent"
            )}
          >
            <span className="text-2xl">{category.icon}</span>
            <span className="whitespace-nowrap font-medium">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
