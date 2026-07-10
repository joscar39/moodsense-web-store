import { describe, expect, it } from "vitest";

import { productListQuerySchema } from "@/lib/validators/catalog";

import { buildProductOrderBy, buildProductWhere } from "./product-query";

const query = (params: Record<string, string> = {}) => productListQuerySchema.parse(params);

describe("buildProductWhere", () => {
  it("always restricts to active products", () => {
    expect(buildProductWhere(query())).toEqual({ isActive: true });
  });

  it("filters by resolved category ids", () => {
    const where = buildProductWhere(query({ category: "ropa" }), ["id1", "id2"]);
    expect(where.categoryId).toEqual({ in: ["id1", "id2"] });
  });

  it("matches nothing when the category slug did not resolve", () => {
    const where = buildProductWhere(query({ category: "no-existe" }), []);
    expect(where.categoryId).toEqual({ in: [] });
  });

  it("filters by brand slug and gender", () => {
    const where = buildProductWhere(query({ brand: "nocturne", gender: "MEN" }));
    expect(where.brand).toEqual({ slug: "nocturne" });
    expect(where.gender).toBe("MEN");
  });

  it("builds a price range in cents", () => {
    const where = buildProductWhere(query({ minPrice: "1000", maxPrice: "5000" }));
    expect(where.priceCents).toEqual({ gte: 1000, lte: 5000 });
  });

  it("builds a half-open price range", () => {
    expect(buildProductWhere(query({ minPrice: "1000" })).priceCents).toEqual({ gte: 1000 });
    expect(buildProductWhere(query({ maxPrice: "5000" })).priceCents).toEqual({ lte: 5000 });
  });

  it("filters on-sale products only when onSale is true", () => {
    expect(buildProductWhere(query({ onSale: "true" })).compareAtPriceCents).toEqual({
      not: null,
    });
    expect(buildProductWhere(query({ onSale: "false" })).compareAtPriceCents).toBeUndefined();
    expect(buildProductWhere(query()).compareAtPriceCents).toBeUndefined();
  });

  it("filters featured products only when featured is true", () => {
    expect(buildProductWhere(query({ featured: "true" })).isFeatured).toBe(true);
    expect(buildProductWhere(query({ featured: "false" })).isFeatured).toBeUndefined();
  });
});

describe("buildProductOrderBy", () => {
  it("maps each sort to a stable order", () => {
    expect(buildProductOrderBy("newest")).toEqual([{ createdAt: "desc" }]);
    expect(buildProductOrderBy("price-asc")).toEqual([
      { priceCents: "asc" },
      { createdAt: "desc" },
    ]);
    expect(buildProductOrderBy("price-desc")).toEqual([
      { priceCents: "desc" },
      { createdAt: "desc" },
    ]);
    expect(buildProductOrderBy("name-asc")).toEqual([{ name: "asc" }]);
  });
});
