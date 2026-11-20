const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Formatea centavos enteros como precio en USD para mostrar. Solo capa de presentación.
 *
 * @example
 * formatPrice(3900); // "$39.00"
 */
export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}

/**
 * Porcentaje de descuento redondeado para los badges de rebaja.
 *
 * @example
 * discountPercent(3500, 4200); // 17
 */
export function discountPercent(priceCents: number, compareAtPriceCents: number): number {
  return Math.round((1 - priceCents / compareAtPriceCents) * 100);
}
