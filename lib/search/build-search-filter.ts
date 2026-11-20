import type { SearchQuery } from "@/lib/validators/catalog";

/** JSON.stringify escapa comillas y barras: evita inyección en la sintaxis de filtros. */
const quote = (value: string) => JSON.stringify(value);

/**
 * Traduce los parámetros de búsqueda validados a expresiones de filtro de
 * Meilisearch. Una categoría coincide con la propia o con su padre, así que
 * buscar dentro de "ropa" incluye productos indexados en "camisetas".
 *
 * @example
 * buildSearchFilter(query); // ['brandSlug = "nocturne"', "priceCents >= 1000"]
 */
export function buildSearchFilter(query: SearchQuery): string[] {
  const filter: string[] = [];

  if (query.category) {
    filter.push(
      `(categorySlug = ${quote(query.category)} OR parentCategorySlug = ${quote(query.category)})`
    );
  }
  if (query.brand) filter.push(`brandSlug = ${quote(query.brand)}`);
  if (query.gender) filter.push(`gender = ${query.gender}`);
  if (query.minPrice !== undefined) filter.push(`priceCents >= ${query.minPrice}`);
  if (query.maxPrice !== undefined) filter.push(`priceCents <= ${query.maxPrice}`);
  if (query.onSale) filter.push("onSale = true");
  if (query.featured) filter.push("isFeatured = true");

  return filter;
}

const SEARCH_SORT_MAP: Record<SearchQuery["sort"], string[] | undefined> = {
  relevance: undefined,
  "price-asc": ["priceCents:asc"],
  "price-desc": ["priceCents:desc"],
  newest: ["createdAtTimestamp:desc"],
};

/**
 * Traduce el orden pedido a la sintaxis de Meilisearch (`undefined` = relevancia).
 *
 * @example
 * buildSearchSort("price-desc"); // ["priceCents:desc"]
 */
export function buildSearchSort(sort: SearchQuery["sort"]): string[] | undefined {
  return SEARCH_SORT_MAP[sort];
}
