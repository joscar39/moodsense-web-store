/** Línea del carrito del navegador (snapshot para mostrar; el servidor revalida todo). */
export type CartItem = {
  variantId: string;
  productSlug: string;
  name: string;
  brandName: string;
  size: string | null;
  color: string | null;
  sku: string;
  unitPriceCents: number;
  imageUrl: string | null;
  quantity: number;
  /** Stock conocido al añadir; limita la cantidad seleccionable en el cliente. */
  maxStock: number;
};

/**
 * Máximo de unidades de una misma variante por pedido. Bajo a propósito: los
 * pedidos por WhatsApp apartan stock sin pagar, y un tope alto permitiría
 * acaparar el inventario con un solo pedido. Lo usan el carrito y la API.
 */
export const MAX_QUANTITY_PER_LINE = 10;

/**
 * Cantidad máxima que el usuario puede elegir para una línea: el stock
 * conocido (mínimo 1) sin pasar de MAX_QUANTITY_PER_LINE.
 *
 * @example
 * maxSelectable(3);  // 3
 * maxSelectable(50); // 10
 * maxSelectable(0);  // 1
 */
export function maxSelectable(maxStock: number): number {
  return Math.min(Math.max(maxStock, 1), MAX_QUANTITY_PER_LINE);
}

/**
 * Ajusta una cantidad deseada al rango [1, maxSelectable(maxStock)].
 *
 * @example
 * clampQuantity(7, 5);  // 5
 * clampQuantity(0, 5);  // 1
 */
export function clampQuantity(quantity: number, maxStock: number): number {
  return Math.min(Math.max(Math.trunc(quantity), 1), maxSelectable(maxStock));
}

/**
 * Añade un ítem al carrito; si la variante ya estaba, suma las cantidades
 * (respetando el tope) y refresca el stock conocido.
 *
 * @example
 * const next = addItemToCart(items, { ...item, quantity: 1 });
 */
export function addItemToCart(items: CartItem[], newItem: CartItem): CartItem[] {
  const existing = items.find((item) => item.variantId === newItem.variantId);
  if (!existing) {
    return [...items, { ...newItem, quantity: clampQuantity(newItem.quantity, newItem.maxStock) }];
  }
  return items.map((item) =>
    item.variantId === newItem.variantId
      ? {
          ...item,
          // Refresca el snapshot de stock; el servidor revalida igual en el checkout.
          maxStock: newItem.maxStock,
          quantity: clampQuantity(item.quantity + newItem.quantity, newItem.maxStock),
        }
      : item
  );
}

/**
 * Fija la cantidad exacta de una línea; 0 o menos la elimina.
 *
 * @example
 * setCartItemQuantity(items, "v1", 3); // v1 con 3 unidades (acotado al stock)
 * setCartItemQuantity(items, "v1", 0); // v1 fuera del carrito
 */
export function setCartItemQuantity(
  items: CartItem[],
  variantId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) return removeCartItem(items, variantId);
  return items.map((item) =>
    item.variantId === variantId
      ? { ...item, quantity: clampQuantity(quantity, item.maxStock) }
      : item
  );
}

/**
 * Quita una variante del carrito.
 *
 * @example
 * removeCartItem(items, "v1");
 */
export function removeCartItem(items: CartItem[], variantId: string): CartItem[] {
  return items.filter((item) => item.variantId !== variantId);
}

/**
 * Total de unidades del carrito (el contador del header).
 *
 * @example
 * cartCount([{ ...a, quantity: 2 }, { ...b, quantity: 1 }]); // 3
 */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Subtotal del carrito en centavos, solo para mostrar (el checkout recalcula con la DB).
 *
 * @example
 * cartSubtotalCents([{ ...a, unitPriceCents: 2500, quantity: 2 }]); // 5000
 */
export function cartSubtotalCents(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
}
