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
  /** Stock known at add time; caps the selectable quantity client-side. */
  maxStock: number;
};

export const MAX_QUANTITY_PER_LINE = 99;

/** Clamps a desired quantity to [1, min(maxStock, MAX_QUANTITY_PER_LINE)]. */
export function clampQuantity(quantity: number, maxStock: number): number {
  const cap = Math.min(Math.max(maxStock, 1), MAX_QUANTITY_PER_LINE);
  return Math.min(Math.max(Math.trunc(quantity), 1), cap);
}

/** Adds an item, merging quantities when the variant is already in the cart. */
export function addItemToCart(items: CartItem[], newItem: CartItem): CartItem[] {
  const existing = items.find((item) => item.variantId === newItem.variantId);
  if (!existing) {
    return [...items, { ...newItem, quantity: clampQuantity(newItem.quantity, newItem.maxStock) }];
  }
  return items.map((item) =>
    item.variantId === newItem.variantId
      ? {
          ...item,
          // Refresh the stock snapshot; the server re-validates at checkout anyway.
          maxStock: newItem.maxStock,
          quantity: clampQuantity(item.quantity + newItem.quantity, newItem.maxStock),
        }
      : item
  );
}

/** Sets an exact quantity; 0 or less removes the line. */
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

export function removeCartItem(items: CartItem[], variantId: string): CartItem[] {
  return items.filter((item) => item.variantId !== variantId);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotalCents(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
}
