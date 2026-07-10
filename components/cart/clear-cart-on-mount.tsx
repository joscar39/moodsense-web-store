"use client";

import { useEffect } from "react";

import { useCartStore } from "@/lib/cart/cart-store";

/** Rendered on the success page: the purchase is done, empty the local cart. */
export function ClearCartOnMount() {
  const clear = useCartStore((state) => state.clear);
  useEffect(() => clear(), [clear]);
  return null;
}
