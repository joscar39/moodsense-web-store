import { prisma } from "@/lib/db/prisma";

import type { OrderStatus } from "@/lib/generated/prisma/enums";

/** Orders that count as revenue. */
const REVENUE_STATUSES: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"];

const LOW_STOCK_THRESHOLD = 3;

/**
 * Sales dashboard metrics, aggregated in the DB. `now` is injectable so the
 * 30-day window is deterministic in tests.
 */
export async function getDashboardMetrics(now = new Date()) {
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const revenueWhere = { status: { in: REVENUE_STATUSES } };

  const [allTime, last30, pendingCount, lowStock, recentOrders, topItems] = await Promise.all([
    prisma.order.aggregate({
      where: revenueWhere,
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { ...revenueWhere, createdAt: { gte: thirtyDaysAgo } },
      _sum: { totalCents: true },
      _count: true,
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.productVariant.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD }, product: { isActive: true } },
      orderBy: { stock: "asc" },
      take: 8,
      select: {
        id: true,
        sku: true,
        size: true,
        color: true,
        stock: true,
        product: { select: { name: true, slug: true } },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, status: true, totalCents: true, createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      where: { order: revenueWhere },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const revenueCents = allTime._sum.totalCents ?? 0;
  const orderCount = allTime._count;

  return {
    revenueCents,
    orderCount,
    averageOrderCents: orderCount > 0 ? Math.round(revenueCents / orderCount) : 0,
    last30: {
      revenueCents: last30._sum.totalCents ?? 0,
      orderCount: last30._count,
    },
    pendingCount,
    lowStock,
    recentOrders,
    topProducts: topItems.map((item) => ({
      name: item.productName,
      units: item._sum.quantity ?? 0,
    })),
  };
}
