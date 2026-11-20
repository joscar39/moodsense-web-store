import { MeilisearchApiError } from "meilisearch";

import { ApiError } from "@/lib/api/handle-api-error";

import { buildSearchFilter, buildSearchSort } from "./build-search-filter";
import { getMeiliClient } from "./client";
import { PRODUCTS_INDEX } from "./products-index";

import type { ProductSearchDocument } from "./products-index";
import type { SearchQuery } from "@/lib/validators/catalog";

/**
 * Búsqueda de texto libre con typo-tolerance en Meilisearch, con los mismos
 * filtros que el PLP. Responde 503 si el índice aún no existe.
 *
 * @example
 * const { items, total } = await searchProducts(searchQuerySchema.parse({ q: "hoodie" }));
 */
export async function searchProducts(query: SearchQuery) {
  const index = getMeiliClient().index<ProductSearchDocument>(PRODUCTS_INDEX);

  try {
    const result = await index.search(query.q, {
      page: query.page,
      hitsPerPage: query.perPage,
      filter: buildSearchFilter(query),
      sort: buildSearchSort(query.sort),
    });

    return {
      items: result.hits,
      query: query.q,
      page: result.page ?? query.page,
      perPage: result.hitsPerPage ?? query.perPage,
      total: result.totalHits ?? 0,
      totalPages: result.totalPages ?? 0,
    };
  } catch (error) {
    // Índice inexistente = nunca se corrió el sync en este entorno.
    if (error instanceof MeilisearchApiError && error.cause?.code === "index_not_found") {
      throw new ApiError(
        "SEARCH_UNAVAILABLE",
        "El índice de búsqueda no está disponible. Ejecutar npm run search:sync.",
        503
      );
    }
    throw error;
  }
}
