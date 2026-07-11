import Link from "next/link";
import { notFound } from "next/navigation";

import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db/prisma";
import { formatPrice } from "@/lib/format/price";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pedido recibido" };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const operatorPhone = process.env.NEXT_PUBLIC_WHATSAPP_OPERATOR_PHONE;
  const waText = encodeURIComponent(
    `Hola, soy ${order.shippingFullName ?? "cliente de Mood Sense"}. Acabo de hacer el pedido ${order.id} por ${formatPrice(order.totalCents)} y quiero coordinar el pago.`
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <ClearCartOnMount />

      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Pedido recibido</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
          ¡Gracias, {order.shippingFullName?.split(" ")[0] ?? "por tu pedido"}!
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Tu pedido quedó <strong>apartado con stock reservado</strong>. Te contactaremos por
          WhatsApp para coordinar el pago; también puedes escribirnos tú directamente para
          agilizarlo.
        </p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">Pedido {order.id}</p>
        <div className="mt-3 flex justify-center">
          <OrderStatusBadge status={order.status} />
        </div>
        {operatorPhone && order.status === "PENDING_PAYMENT" && (
          <Button
            size="lg"
            className="mt-6 rounded-none px-8 tracking-[0.15em] uppercase"
            render={
              <a
                href={`https://wa.me/${operatorPhone}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Coordinar pago por WhatsApp
          </Button>
        )}
      </div>

      <div className="mt-12 border p-6">
        <h2 className="mb-4 text-xs tracking-[0.25em] uppercase">Resumen</h2>
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
        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Button
          variant="outline"
          className="rounded-none px-8 tracking-[0.2em] uppercase"
          render={<Link href="/products" />}
        >
          Seguir comprando
        </Button>
      </div>
    </div>
  );
}
