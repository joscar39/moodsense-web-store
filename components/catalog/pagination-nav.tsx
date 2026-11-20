import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Paginación por enlaces (Anterior / Siguiente) que conserva los filtros actuales.
 * No renderiza nada si hay una sola página.
 *
 * @example
 * <PaginationNav page={2} totalPages={5} basePath="/products" searchParams={{ brand: "atlas-supply" }} />
 * // "Siguiente" → /products?brand=atlas-supply&page=3
 */
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

  // URL de una página concreta; la página 1 omite `page` para dejar la URL limpia.
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
