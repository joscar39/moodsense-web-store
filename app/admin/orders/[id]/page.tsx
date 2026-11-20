import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { Separator } from "@/components/ui/separator";
import { getAdminOrder } from "@/lib/admin/orders";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { formatPrice } from "@/lib/format/price";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalle de pedido" };

const dateFormatter = new Intl.DateTimeFormat("es", { dateStyle: "long", timeStyle: "short" });

/**
 * Página /admin/orders/[id]: detalle de un pedido (items, envío, payment
 * intent) con los botones de cambio de estado. 404 si no existe.
 *
 * @example
 * // GET /admin/orders/ord_123 → detalle + OrderStatusControl
 */
export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;

  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-xs tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
      >
        ← Pedidos
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Pedido</h2>
          <p className="font-mono text-xs">{order.id}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {dateFormatter.format(order.createdAt)}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.user?.name ?? "Invitado"} · {order.email || "sin email"}
          </p>
        </div>
        <div className="space-y-3 text-right">
          <OrderStatusBadge status={order.status} />
          <OrderStatusControl orderId={order.id} status={order.status} />
        </div>
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
        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
        </div>
        {order.stripePaymentIntentId && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {order.stripePaymentIntentId}
          </p>
        )}
      </div>

      {order.shippingLine1 && (
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
            {order.shippingPhone && ` · ${order.shippingPhone}`}
          </p>
        </div>
      )}
    </div>
  );
}
