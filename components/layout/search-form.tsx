"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";

/**
 * Buscador del header: al enviar navega a `/search?q=…` (ignora búsquedas vacías).
 *
 * @example
 * <SearchForm defaultQuery="hoodie" />
 */
export function SearchForm({ defaultQuery = "" }: { defaultQuery?: string }) {
  const router = useRouter();

  return (
    <form
      role="search"
      className="relative w-full max-w-xs"
      onSubmit={(event) => {
        event.preventDefault();
        const query = new FormData(event.currentTarget).get("q");
        if (typeof query === "string" && query.trim()) {
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
      }}
    >
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        name="q"
        defaultValue={defaultQuery}
        placeholder="Buscar productos…"
        aria-label="Buscar productos"
        className="h-9 bg-background pl-9"
      />
    </form>
  );
}
