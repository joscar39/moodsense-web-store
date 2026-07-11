import { redirect } from "next/navigation";

import { ManualCheckoutForm } from "@/components/checkout/manual-checkout-form";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Finalizar pedido" };

export default function CheckoutPage() {
  // Con Stripe activo el checkout es la página hosted de Stripe, no esta.
  if (process.env.NEXT_PUBLIC_CHECKOUT_MODE === "stripe") redirect("/cart");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Último paso</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Finalizar pedido</h1>
      </header>
      <ManualCheckoutForm />
    </div>
  );
}
