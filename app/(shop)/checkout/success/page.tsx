import Link from "next/link";

import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/format/price";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pedido confirmado" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Página /checkout/success: vuelta desde Stripe. Busca el pedido por
 * `session_id`, muestra el resumen (pagado o en proceso) y vacía el carrito.
 *
 * @example
 * // URL: /checkout/success?session_id=cs_test_123
 */
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : null;

  const order = sessionId
    ? await prisma.order.findUnique({
        where: { stripeCheckoutSessionId: sessionId },
        include: { items: true },
      })
    : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-serif text-4xl tracking-tight">Pedido no encontrado</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          No pudimos localizar este pedido. Si el pago se realizó, recibirás la confirmación por
          email.
        </p>
        <Button
          className="mt-8 rounded-none px-8 tracking-[0.2em] uppercase"
          render={<Link href="/products" />}
        >
          Volver a la tienda
        </Button>
      </div>
    );
  }

  const paid = order.status === "PAID";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <ClearCartOnMount />

      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
          {paid ? "Pedido confirmado" : "Procesando pago"}
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
          {paid ? "¡Gracias por tu compra!" : "Estamos confirmando tu pago…"}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {paid
            ? `Enviamos la confirmación a ${order.email || "tu email"}.`
            : "Tu pago está siendo procesado por Stripe. Actualiza esta página en unos segundos."}
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">Pedido {order.id}</p>
      </div>

      <div className="mt-12 border p-6">
        <h2 className="mb-4 text-xs tracking-[0.25em] uppercase">Resumen del pedido</h2>
        <ul className="space-y-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.quantity} × {item.productName}
                {item.variantLabel && (
                  <span className="text-muted-foreground"> ({item.variantLabel})</span>
                )}
              </span>
              <span className="tabular-nums">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span>Gratis</span>
        </div>
        <div className="mt-2 flex justify-between text-base font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Button
          className="rounded-none px-8 tracking-[0.2em] uppercase"
          render={<Link href="/products" />}
        >
          Seguir comprando
        </Button>
      </div>
    </div>
  );
}
