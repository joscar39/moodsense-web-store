"use client";

import { ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cartCount } from "@/lib/cart/cart-logic";
import { useCartStore } from "@/lib/cart/cart-store";

/**
 * Botón del carrito en el header con el contador de unidades.
 *
 * @example
 * <CartButton />
 */
export function CartButton() {
  const items = useCartStore((state) => state.items);
  // El store persistido solo existe en el cliente: el contador se muestra tras
  // montar para que el render del servidor y el primero del cliente coincidan.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount(items) : 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label={`Carrito (${count} ${count === 1 ? "artículo" : "artículos"})`}
      render={<Link href="/cart" />}
    >
      <ShoppingBagIcon className="size-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-navy text-[10px] font-medium text-gold">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}
