import { describe, expect, it } from "vitest";

import { productListQuerySchema, searchQuerySchema } from "./catalog";

describe("productListQuerySchema", () => {
  it("applies defaults on an empty query", () => {
    const query = productListQuerySchema.parse({});
    expect(query).toMatchObject({ page: 1, perPage: 12, sort: "newest" });
  });

  it("coerces numeric strings from search params", () => {
    const query = productListQuerySchema.parse({ page: "3", perPage: "24", minPrice: "1000" });
    expect(query.page).toBe(3);
    expect(query.perPage).toBe(24);
    expect(query.minPrice).toBe(1000);
  });

  it("coerces boolean strings for onSale/featured", () => {
    const query = productListQuerySchema.parse({ onSale: "true", featured: "false" });
    expect(query.onSale).toBe(true);
    expect(query.featured).toBe(false);
  });

  it("caps perPage at 60", () => {
    expect(productListQuerySchema.safeParse({ perPage: "100" }).success).toBe(false);
  });

  it("rejects page 0", () => {
    expect(productListQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("rejects unknown sort values", () => {
    expect(productListQuerySchema.safeParse({ sort: "cheapest" }).success).toBe(false);
  });

  it("rejects unknown gender values", () => {
    expect(productListQuerySchema.safeParse({ gender: "KIDS" }).success).toBe(false);
  });

  it("rejects minPrice greater than maxPrice", () => {
    expect(productListQuerySchema.safeParse({ minPrice: "5000", maxPrice: "1000" }).success).toBe(
      false
    );
  });

  it("accepts an equal min/max price range", () => {
    expect(productListQuerySchema.safeParse({ minPrice: "1000", maxPrice: "1000" }).success).toBe(
      true
    );
  });
});

describe("searchQuerySchema", () => {
  it("requires a non-empty q", () => {
    expect(searchQuerySchema.safeParse({}).success).toBe(false);
    expect(searchQuerySchema.safeParse({ q: "  " }).success).toBe(false);
  });

  it("defaults sort to relevance", () => {
    expect(searchQuerySchema.parse({ q: "hoodie" }).sort).toBe("relevance");
  });

  it("rejects q longer than 200 characters", () => {
    expect(searchQuerySchema.safeParse({ q: "a".repeat(201) }).success).toBe(false);
  });
});
