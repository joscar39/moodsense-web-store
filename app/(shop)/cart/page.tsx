import { CartView } from "@/components/cart/cart-view";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Carrito" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Tu selección</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Carrito</h1>
      </header>
      <CartView />
    </div>
  );
}
