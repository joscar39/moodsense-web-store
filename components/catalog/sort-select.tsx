"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_LABELS: Record<string, string> = {
  newest: "Novedades",
  "price-asc": "Precio: menor a mayor",
  "price-desc": "Precio: mayor a menor",
  "name-asc": "Nombre A–Z",
};

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams.get("sort") ?? "newest";

  return (
    <Select
      value={value}
      onValueChange={(sort) => {
        const params = new URLSearchParams(searchParams);
        if (sort === "newest") params.delete("sort");
        else params.set("sort", String(sort));
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }}
    >
      <SelectTrigger className="w-52" aria-label="Ordenar por">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SORT_LABELS).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
