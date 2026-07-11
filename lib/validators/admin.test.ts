import { describe, expect, it } from "vitest";

import { adminProductSchema } from "./admin";

const validProduct = {
  name: "Test Tee",
  slug: "test-tee",
  description: "Una camiseta de prueba con descripción suficiente.",
  priceCents: "3900",
  brandId: "brand1",
  categoryId: "cat1",
  variants: [
    { sku: "ms-tst-001-m", size: "M", stock: "5" },
    { sku: "MS-TST-001-L", size: "L", stock: "3" },
  ],
};

describe("adminProductSchema", () => {
  it("accepts a valid product, coercing and normalizing", () => {
    const parsed = adminProductSchema.parse(validProduct);
    expect(parsed.priceCents).toBe(3900);
    expect(parsed.gender).toBe("UNISEX");
    expect(parsed.isActive).toBe(true);
    expect(parsed.variants[0].sku).toBe("MS-TST-001-M"); // uppercased
    expect(parsed.variants[0].stock).toBe(5);
  });

  it("rejects compareAt lower than or equal to the price", () => {
    expect(
      adminProductSchema.safeParse({ ...validProduct, compareAtPriceCents: "3900" }).success
    ).toBe(false);
    expect(
      adminProductSchema.safeParse({ ...validProduct, compareAtPriceCents: "5000" }).success
    ).toBe(true);
  });

  it("treats empty-string compareAt as absent (form inputs)", () => {
    const parsed = adminProductSchema.parse({ ...validProduct, compareAtPriceCents: "" });
    expect(parsed.compareAtPriceCents).toBeUndefined();
  });

  it("rejects duplicated SKUs (case-insensitive after normalization)", () => {
    const dup = {
      ...validProduct,
      variants: [
        { sku: "MS-TST-001-M", size: "M", stock: "1" },
        { sku: "ms-tst-001-m", size: "L", stock: "1" },
      ],
    };
    expect(adminProductSchema.safeParse(dup).success).toBe(false);
  });

  it("rejects duplicated size/color combinations", () => {
    const dup = {
      ...validProduct,
      variants: [
        { sku: "MS-TST-001-M", size: "M", color: "Negro", stock: "1" },
        { sku: "MS-TST-002-M", size: "M", color: "Negro", stock: "1" },
      ],
    };
    expect(adminProductSchema.safeParse(dup).success).toBe(false);
  });

  it("requires at least one variant and a kebab-case slug", () => {
    expect(adminProductSchema.safeParse({ ...validProduct, variants: [] }).success).toBe(false);
    expect(adminProductSchema.safeParse({ ...validProduct, slug: "Con Espacios" }).success).toBe(
      false
    );
  });

  it("rejects negative stock", () => {
    const bad = {
      ...validProduct,
      variants: [{ sku: "MS-TST-001-M", size: "M", stock: "-1" }],
    };
    expect(adminProductSchema.safeParse(bad).success).toBe(false);
  });
});
