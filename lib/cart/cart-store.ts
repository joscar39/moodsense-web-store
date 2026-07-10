import { create } from "zustand";
import { persist } from "zustand/middleware";

import { addItemToCart, removeCartItem, setCartItemQuantity } from "./cart-logic";

import type { CartItem } from "./cart-logic";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

/**
 * Client cart, persisted to localStorage. Prices/stock here are display
 * snapshots — the checkout endpoint re-validates everything against the DB.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: addItemToCart(state.items, item) })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({ items: setCartItemQuantity(state.items, variantId, quantity) })),
      removeItem: (variantId) =>
        set((state) => ({ items: removeCartItem(state.items, variantId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "moodsense-cart", version: 1 }
  )
);
