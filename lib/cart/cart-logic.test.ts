import { describe, expect, it } from "vitest";

import {
  MAX_QUANTITY_PER_LINE,
  addItemToCart,
  cartCount,
  cartSubtotalCents,
  clampQuantity,
  removeCartItem,
  setCartItemQuantity,
} from "./cart-logic";

import type { CartItem } from "./cart-logic";

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  variantId: "v1",
  productSlug: "vibe-check-oversized-tee",
  name: "Vibe Check Oversized Tee",
  brandName: "Atlas Supply",
  size: "M",
  color: "Crema",
  sku: "MS-ATL-001-M",
  unitPriceCents: 3900,
  imageUrl: null,
  quantity: 1,
  maxStock: 8,
  ...overrides,
});

describe("clampQuantity", () => {
  it("clamps to [1, maxStock]", () => {
    expect(clampQuantity(0, 8)).toBe(1);
    expect(clampQuantity(-5, 8)).toBe(1);
    expect(clampQuantity(3, 8)).toBe(3);
    expect(clampQuantity(20, 8)).toBe(8);
  });

  it("caps at MAX_QUANTITY_PER_LINE even with huge stock", () => {
    expect(clampQuantity(500, 10_000)).toBe(MAX_QUANTITY_PER_LINE);
  });

  it("keeps at least 1 when stock reports 0 (server re-validates)", () => {
    expect(clampQuantity(2, 0)).toBe(1);
  });

  it("truncates fractional quantities", () => {
    expect(clampQuantity(2.7, 8)).toBe(2);
  });
});

describe("addItemToCart", () => {
  it("appends a new variant", () => {
    const result = addItemToCart([item()], item({ variantId: "v2", sku: "MS-ATL-001-L" }));
    expect(result).toHaveLength(2);
  });

  it("merges quantities for the same variant", () => {
    const result = addItemToCart([item({ quantity: 2 })], item({ quantity: 3 }));
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(5);
  });

  it("clamps merged quantity to stock", () => {
    const result = addItemToCart([item({ quantity: 6 })], item({ quantity: 6, maxStock: 8 }));
    expect(result[0].quantity).toBe(8);
  });

  it("refreshes the stock snapshot when re-adding", () => {
    const result = addItemToCart([item({ maxStock: 8 })], item({ maxStock: 3 }));
    expect(result[0].maxStock).toBe(3);
    expect(result[0].quantity).toBe(2); // 1 + 1, still under cap
  });
});

describe("setCartItemQuantity", () => {
  it("sets and clamps the quantity", () => {
    expect(setCartItemQuantity([item()], "v1", 4)[0].quantity).toBe(4);
    expect(setCartItemQuantity([item()], "v1", 50)[0].quantity).toBe(8);
  });

  it("removes the line at quantity 0", () => {
    expect(setCartItemQuantity([item()], "v1", 0)).toHaveLength(0);
  });

  it("ignores unknown variants", () => {
    const items = [item()];
    expect(setCartItemQuantity(items, "nope", 5)).toEqual(items);
  });
});

describe("removeCartItem / totals", () => {
  it("removes by variant id", () => {
    expect(removeCartItem([item(), item({ variantId: "v2" })], "v1")).toHaveLength(1);
  });

  it("computes count and subtotal", () => {
    const items = [
      item({ quantity: 2, unitPriceCents: 3900 }),
      item({ variantId: "v2", quantity: 1, unitPriceCents: 12900 }),
    ];
    expect(cartCount(items)).toBe(3);
    expect(cartSubtotalCents(items)).toBe(2 * 3900 + 12900);
  });
});
