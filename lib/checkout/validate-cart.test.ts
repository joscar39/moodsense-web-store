import { describe, expect, it } from "vitest";

import { dedupeCheckoutItems, validateCart } from "./validate-cart";

import type { CatalogVariant } from "./validate-cart";

const variant = (overrides: Partial<CatalogVariant> = {}): CatalogVariant => ({
  id: "v1",
  sku: "MS-ATL-001-M",
  size: "M",
  color: "Crema",
  priceCents: null,
  stock: 8,
  product: {
    name: "Vibe Check Oversized Tee",
    slug: "vibe-check-oversized-tee",
    isActive: true,
    priceCents: 3900,
  },
  ...overrides,
});

describe("dedupeCheckoutItems", () => {
  it("merges duplicated variant ids by summing quantities", () => {
    expect(
      dedupeCheckoutItems([
        { variantId: "v1", quantity: 2 },
        { variantId: "v2", quantity: 1 },
        { variantId: "v1", quantity: 3 },
      ])
    ).toEqual([
      { variantId: "v1", quantity: 5 },
      { variantId: "v2", quantity: 1 },
    ]);
  });
});

describe("validateCart", () => {
  it("prices lines from the DB (product base price)", () => {
    const result = validateCart([{ variantId: "v1", quantity: 2 }], [variant()]);
    expect(result.issues).toHaveLength(0);
    expect(result.lines[0]).toMatchObject({
      unitPriceCents: 3900,
      quantity: 2,
      sku: "MS-ATL-001-M",
      variantLabel: "Crema · M",
    });
    expect(result.subtotalCents).toBe(7800);
  });

  it("prefers the variant price override over the product price", () => {
    const result = validateCart(
      [{ variantId: "v1", quantity: 1 }],
      [variant({ priceCents: 4500 })]
    );
    expect(result.lines[0].unitPriceCents).toBe(4500);
  });

  it("reports unknown variants", () => {
    const result = validateCart([{ variantId: "ghost", quantity: 1 }], [variant()]);
    expect(result.lines).toHaveLength(0);
    expect(result.issues[0]).toMatchObject({ variantId: "ghost", code: "NOT_FOUND" });
  });

  it("reports inactive products", () => {
    const inactive = variant({ product: { ...variant().product, isActive: false } });
    const result = validateCart([{ variantId: "v1", quantity: 1 }], [inactive]);
    expect(result.issues[0].code).toBe("INACTIVE");
  });

  it("reports insufficient stock with the available amount", () => {
    const result = validateCart([{ variantId: "v1", quantity: 9 }], [variant({ stock: 3 })]);
    expect(result.issues[0]).toMatchObject({ code: "INSUFFICIENT_STOCK", availableStock: 3 });
  });

  it("treats duplicated lines as one when checking stock", () => {
    const result = validateCart(
      [
        { variantId: "v1", quantity: 5 },
        { variantId: "v1", quantity: 5 },
      ],
      [variant({ stock: 8 })]
    );
    expect(result.issues[0].code).toBe("INSUFFICIENT_STOCK");
  });

  it("null variantLabel for one-size items without color", () => {
    const oneSize = variant({ size: null, color: null });
    const result = validateCart([{ variantId: "v1", quantity: 1 }], [oneSize]);
    expect(result.lines[0].variantLabel).toBeNull();
  });
});
