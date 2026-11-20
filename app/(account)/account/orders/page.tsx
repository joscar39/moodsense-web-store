import Link from "next/link";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { listOrders } from "@/lib/account/orders";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/format/price";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mis pedidos" };

const dateFormatter = new Intl.DateTimeFormat("es", { dateStyle: "long" });

/**
 * Página /account/orders: lista de pedidos del usuario con estado y total.
 *
 * @example
 * // GET /account/orders → enlaces a /account/orders/[id]
 */
export default async function OrdersPage() {
  const session = await auth();
  const orders = await listOrders(session!.user.id);

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="mb-2 font-serif text-2xl tracking-tight">Pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Aún no tienes pedidos.{" "}
          <Link href="/products" className="text-foreground underline underline-offset-4">
            Descubre la tienda
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl tracking-tight">Pedidos</h2>
      <ul className="divide-y border-y">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/account/orders/${order.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-2 py-4 transition-colors hover:bg-accent/50"
            >
              <div>
                <p className="font-mono text-xs">{order.id}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dateFormatter.format(order.createdAt)} · {order._count.items}{" "}
                  {order._count.items === 1 ? "artículo" : "artículos"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={order.status} />
                <span className="text-sm font-medium tabular-nums">
                  {formatPrice(order.totalCents)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
