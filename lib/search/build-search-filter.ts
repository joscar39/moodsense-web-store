import type { SearchQuery } from "@/lib/validators/catalog";

/** JSON.stringify escapes quotes/backslashes, preventing filter injection. */
const quote = (value: string) => JSON.stringify(value);

/**
 * Maps validated search params to Meilisearch filter expressions.
 * A category slug matches either the category itself or its parent, so
 * searching within "ropa" includes products indexed under "camisetas".
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

export function buildSearchSort(sort: SearchQuery["sort"]): string[] | undefined {
  return SEARCH_SORT_MAP[sort];
}
