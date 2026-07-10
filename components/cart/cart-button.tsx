"use client";

import { ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cartCount } from "@/lib/cart/cart-logic";
import { useCartStore } from "@/lib/cart/cart-store";

export function CartButton() {
  const items = useCartStore((state) => state.items);
  // The persisted store only exists client-side; render the count after mount
  // so server and first client render match (no hydration mismatch).
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
