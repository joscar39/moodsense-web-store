const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Formats integer cents for display ("$39.00"). Presentation layer only. */
export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}

/** Discount percentage for sale badges (e.g. 4200 → 3500 = 17). */
export function discountPercent(priceCents: number, compareAtPriceCents: number): number {
  return Math.round((1 - priceCents / compareAtPriceCents) * 100);
}
