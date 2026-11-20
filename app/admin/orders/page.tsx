import Link from "next/link";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { ORDER_STATUS_LABELS } from "@/lib/admin/order-status";
import { listAdminOrders } from "@/lib/admin/orders";
import { expireStaleManualOrders } from "@/lib/checkout/expire-orders";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { firstSearchParamValues } from "@/lib/api/search-params";
import { formatPrice } from "@/lib/format/price";
import { OrderStatus } from "@/lib/generated/prisma/enums";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pedidos" };

const dateFormatter = new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" });

const FILTERS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  ...Object.values(OrderStatus).map((status) => ({
    value: status,
    label: ORDER_STATUS_LABELS[status],
  })),
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Página /admin/orders: lista de pedidos con chips de filtro por estado
 * (`?status=PAID`). Antes de listar ejecuta el barrido de pedidos vencidos.
 *
 * @example
 * // GET /admin/orders?status=PENDING_PAYMENT → pedidos esperando pago
 */
export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminPage();
  // Barrido oportunista: expira PENDING_PAYMENT vencidos y libera su stock.
  await expireStaleManualOrders();
  const raw = firstSearchParamValues(await searchParams);
  const statusFilter = Object.values(OrderStatus).includes(raw.status as OrderStatus)
    ? (raw.status as OrderStatus)
    : undefined;

  const orders = await listAdminOrders(statusFilter);

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl tracking-tight">Pedidos</h2>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = (filter.value === "ALL" && !statusFilter) || filter.value === statusFilter;
          const href =
            filter.value === "ALL" ? "/admin/orders" : `/admin/orders?status=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              className={`border px-3 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay pedidos con este filtro.</p>
      ) : (
        <ul className="divide-y border-y text-sm">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-2 py-4 hover:bg-accent/50"
              >
                <span className="min-w-0">
                  <span className="block font-mono text-xs">{order.id}</span>
                  <span className="block truncate text-muted-foreground">
                    {order.user?.name ? `${order.user.name} · ` : ""}
                    {order.email || "invitado"} · {dateFormatter.format(order.createdAt)} ·{" "}
                    {order._count.items} art.
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-medium tabular-nums">{formatPrice(order.totalCents)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
