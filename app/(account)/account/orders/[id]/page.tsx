import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { Separator } from "@/components/ui/separator";
import { getOrder } from "@/lib/account/orders";
import { ApiError } from "@/lib/api/handle-api-error";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/format/price";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalle del pedido" };

const dateFormatter = new Intl.DateTimeFormat("es", { dateStyle: "long", timeStyle: "short" });

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  let order;
  try {
    order = await getOrder(session!.user.id, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const hasShipping = Boolean(order.shippingLine1);

  return (
    <div>
      <Link
        href="/account/orders"
        className="text-xs tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
      >
        ← Pedidos
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Pedido</h2>
          <p className="font-mono text-xs">{order.id}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {dateFormatter.format(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-8 border p-6">
        <h3 className="mb-4 text-xs tracking-[0.25em] uppercase">Artículos</h3>
        <ul className="space-y-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.quantity} × {item.productName}
                {item.variantLabel && (
                  <span className="text-muted-foreground"> ({item.variantLabel})</span>
                )}
                <span className="ml-2 font-mono text-xs text-muted-foreground">{item.sku}</span>
              </span>
              <span className="tabular-nums">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPrice(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span>{order.shippingCents === 0 ? "Gratis" : formatPrice(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>

      {hasShipping && (
        <div className="mt-6 border p-6">
          <h3 className="mb-3 text-xs tracking-[0.25em] uppercase">Envío</h3>
          <p className="text-sm leading-relaxed">
            {order.shippingFullName}
            <br />
            {order.shippingLine1}
            {order.shippingLine2 && (
              <>
                <br />
                {order.shippingLine2}
              </>
            )}
            <br />
            {[order.shippingCity, order.shippingState, order.shippingPostalCode]
              .filter(Boolean)
              .join(", ")}
            <br />
            {order.shippingCountry}
          </p>
        </div>
      )}
    </div>
  );
}
