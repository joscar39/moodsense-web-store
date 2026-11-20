"use client";

import { useEffect } from "react";

import { useCartStore } from "@/lib/cart/cart-store";

/**
 * Vacía el carrito local al montarse. Se usa en las páginas de confirmación:
 * el pedido ya está hecho. No renderiza nada.
 *
 * @example
 * <ClearCartOnMount />
 */
export function ClearCartOnMount() {
  const clear = useCartStore((state) => state.clear);
  useEffect(() => clear(), [clear]);
  return null;
}
