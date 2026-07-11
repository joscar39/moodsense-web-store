import Link from "next/link";

import { OrderStatusBadge } from "@/components/account/order-status-badge";
import { getDashboardMetrics } from "@/lib/admin/dashboard";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { formatPrice } from "@/lib/format/price";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const dateFormatter = new Intl.DateTimeFormat("es", { dateStyle: "medium" });

export default async function AdminDashboardPage() {
  await requireAdminPage();
  const metrics = await getDashboardMetrics();

  const stats = [
    { label: "Ingresos totales", value: formatPrice(metrics.revenueCents) },
    { label: "Pedidos cobrados", value: String(metrics.orderCount) },
    { label: "Ticket promedio", value: formatPrice(metrics.averageOrderCents) },
    { label: "Ingresos últimos 30 días", value: formatPrice(metrics.last30.revenueCents) },
    { label: "Pedidos últimos 30 días", value: String(metrics.last30.orderCount) },
    { label: "Pedidos pendientes", value: String(metrics.pendingCount) },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 font-serif text-2xl tracking-tight">Ventas</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border p-5">
              <p className="text-xs tracking-[0.15em] text-muted-foreground uppercase">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-medium tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-serif text-2xl tracking-tight">Últimos pedidos</h2>
          {metrics.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay pedidos.</p>
          ) : (
            <ul className="divide-y border-y text-sm">
              {metrics.recentOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between gap-3 px-2 py-3 hover:bg-accent/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{order.email || "—"}</span>
                      <span className="text-xs text-muted-foreground">
                        {dateFormatter.format(order.createdAt)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-4 font-serif text-2xl tracking-tight">Top productos</h2>
          {metrics.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin ventas todavía.</p>
          ) : (
            <ul className="divide-y border-y text-sm">
              {metrics.topProducts.map((product) => (
                <li key={product.name} className="flex justify-between px-2 py-3">
                  <span>{product.name}</span>
                  <span className="text-muted-foreground tabular-nums">{product.units} uds.</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-2xl tracking-tight">Stock bajo (≤ 3)</h2>
        {metrics.lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin alertas de stock.</p>
        ) : (
          <ul className="divide-y border-y text-sm">
            {metrics.lowStock.map((variant) => (
              <li key={variant.id} className="flex items-center justify-between gap-3 px-2 py-3">
                <span className="min-w-0">
                  <span className="block truncate">
                    {variant.product.name}
                    <span className="text-muted-foreground">
                      {" "}
                      {[variant.color, variant.size].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{variant.sku}</span>
                </span>
                <span
                  className={`shrink-0 tabular-nums ${variant.stock === 0 ? "font-medium text-destructive" : ""}`}
                >
                  {variant.stock} uds.
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
