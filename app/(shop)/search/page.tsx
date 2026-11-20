import { SearchForm } from "@/components/layout/search-form";
import { PaginationNav } from "@/components/catalog/pagination-nav";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ApiError } from "@/lib/api/handle-api-error";
import { firstSearchParamValues } from "@/lib/api/search-params";
import { searchProducts } from "@/lib/search/search-products";
import { searchQuerySchema } from "@/lib/validators/catalog";

import type { SearchQuery } from "@/lib/validators/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Buscar" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Página /search: búsqueda de texto libre sobre Meilisearch reutilizando el grid del PLP.
 *
 * @example
 * // GET /search?q=hoodie&sort=price-asc
 */
export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = firstSearchParamValues(await searchParams);
  const parsed = searchQuerySchema.safeParse(raw);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-10 space-y-6">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Buscar</h1>
        <SearchForm defaultQuery={parsed.success ? parsed.data.q : ""} />
      </header>

      {parsed.success ? (
        <SearchResults query={parsed.data} rawParams={raw} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Escribe qué estás buscando: una marca, una prenda, un mood.
        </p>
      )}
    </div>
  );
}

/**
 * Resultados de búsqueda paginados (Server Component dentro de Suspense).
 *
 * @example
 * <SearchResults query={query} rawParams={raw} />
 */
async function SearchResults({
  query,
  rawParams,
}: {
  query: SearchQuery;
  rawParams: Record<string, string>;
}) {
  try {
    const result = await searchProducts(query);

    return (
      <div>
        <p className="mb-4 text-xs tracking-[0.2em] text-muted-foreground uppercase">
          {result.total} {result.total === 1 ? "resultado" : "resultados"} para “{query.q}”
        </p>
        <ProductGrid
          products={result.items.map((hit) => ({
            slug: hit.slug,
            name: hit.name,
            brandName: hit.brandName,
            priceCents: hit.priceCents,
            compareAtPriceCents: hit.compareAtPriceCents,
            image: hit.imageUrl ? { url: hit.imageUrl, alt: hit.imageAlt ?? hit.name } : null,
            inStock: hit.inStock,
          }))}
        />
        <PaginationNav
          page={result.page}
          totalPages={result.totalPages}
          basePath="/search"
          searchParams={rawParams}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.code === "SEARCH_UNAVAILABLE") {
      return (
        <p className="text-sm text-muted-foreground">
          La búsqueda no está disponible en este momento. Inténtalo de nuevo en unos minutos.
        </p>
      );
    }
    throw error;
  }
}
