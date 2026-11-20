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
 * Carrito del navegador (Zustand), persistido en localStorage (`moodsense-cart`).
 * Precios y stock son snapshots para mostrar: el checkout revalida todo contra la DB.
 *
 * @example
 * const items = useCartStore((state) => state.items);
 * useCartStore.getState().addItem(item);
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
