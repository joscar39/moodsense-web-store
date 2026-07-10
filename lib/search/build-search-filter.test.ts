import { describe, expect, it } from "vitest";

import { searchQuerySchema } from "@/lib/validators/catalog";

import { buildSearchFilter, buildSearchSort } from "./build-search-filter";

const query = (params: Record<string, string> = {}) =>
  searchQuerySchema.parse({ q: "tee", ...params });

describe("buildSearchFilter", () => {
  it("returns no filters for a plain query", () => {
    expect(buildSearchFilter(query())).toEqual([]);
  });

  it("matches a category as own slug or parent slug", () => {
    expect(buildSearchFilter(query({ category: "ropa" }))).toEqual([
      '(categorySlug = "ropa" OR parentCategorySlug = "ropa")',
    ]);
  });

  it("combines brand, gender, price range and flags", () => {
    const filter = buildSearchFilter(
      query({
        brand: "nocturne",
        gender: "MEN",
        minPrice: "1000",
        maxPrice: "9900",
        onSale: "true",
        featured: "true",
      })
    );
    expect(filter).toEqual([
      'brandSlug = "nocturne"',
      "gender = MEN",
      "priceCents >= 1000",
      "priceCents <= 9900",
      "onSale = true",
      "isFeatured = true",
    ]);
  });

  it("escapes quotes in slugs to prevent filter injection", () => {
    const filter = buildSearchFilter(query({ brand: 'x" OR inStock = false OR brandSlug = "y' }));
    expect(filter).toEqual(['brandSlug = "x\\" OR inStock = false OR brandSlug = \\"y"']);
  });

  it("does not emit onSale/featured filters when false", () => {
    expect(buildSearchFilter(query({ onSale: "false", featured: "false" }))).toEqual([]);
  });
});

describe("buildSearchSort", () => {
  it("maps sorts to Meilisearch syntax, with relevance unset", () => {
    expect(buildSearchSort("relevance")).toBeUndefined();
    expect(buildSearchSort("price-asc")).toEqual(["priceCents:asc"]);
    expect(buildSearchSort("price-desc")).toEqual(["priceCents:desc"]);
    expect(buildSearchSort("newest")).toEqual(["createdAtTimestamp:desc"]);
  });
});
