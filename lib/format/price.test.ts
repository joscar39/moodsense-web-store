import { describe, expect, it } from "vitest";

import { discountPercent, formatPrice } from "./price";

describe("formatPrice", () => {
  it("formats cents as USD", () => {
    expect(formatPrice(3900)).toBe("$39.00");
    expect(formatPrice(15950)).toBe("$159.50");
    expect(formatPrice(0)).toBe("$0.00");
  });
});

describe("discountPercent", () => {
  it("rounds the discount percentage", () => {
    expect(discountPercent(3500, 4200)).toBe(17);
    expect(discountPercent(7500, 8900)).toBe(16);
    expect(discountPercent(5000, 10000)).toBe(50);
  });
});
