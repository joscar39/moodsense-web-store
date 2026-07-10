import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Link-based pagination that preserves the current filters. */
export function PaginationNav({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const params = new URLSearchParams(searchParams);
    if (target === 1) params.delete("page");
    else params.set("page", String(target));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <nav className="mt-12 flex items-center justify-center gap-4" aria-label="Paginación">
      {page > 1 ? (
        <Button
          variant="outline"
          className="rounded-none"
          render={<Link href={hrefFor(page - 1)} />}
        >
          ← Anterior
        </Button>
      ) : (
        <Button variant="outline" className="rounded-none" disabled>
          ← Anterior
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <Button
          variant="outline"
          className="rounded-none"
          render={<Link href={hrefFor(page + 1)} />}
        >
          Siguiente →
        </Button>
      ) : (
        <Button variant="outline" className="rounded-none" disabled>
          Siguiente →
        </Button>
      )}
    </nav>
  );
}
