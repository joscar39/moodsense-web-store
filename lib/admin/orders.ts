import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";
import { restoreStock, stockLinesFromOrderItems } from "@/lib/inventory/stock";

import { canTransition, STOCK_HELD_STATUSES } from "./order-status";

import type { OrderStatus } from "@/lib/generated/prisma/enums";

export function listAdminOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      status: true,
      totalCents: true,
      createdAt: true,
      user: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });
}

export async function getAdminOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
  if (!order) throw new ApiError("NOT_FOUND", "Pedido no encontrado.", 404);
  return order;
}

/**
 * Applies a manual status change, enforcing the allowed transitions.
 * Cancelling an order whose stock is held (PENDING_PAYMENT/PAID/…) restores
 * inventory in the same transaction; refunds do NOT restore stock (the goods
 * may be with the customer).
 */
export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true, items: { select: { variantId: true, quantity: true } } },
  });
  if (!order) throw new ApiError("NOT_FOUND", "Pedido no encontrado.", 404);

  if (!canTransition(order.status, status)) {
    throw new ApiError(
      "INVALID_TRANSITION",
      `No se puede pasar un pedido de ${order.status} a ${status}.`,
      409
    );
  }

  const mustRestoreStock = status === "CANCELLED" && STOCK_HELD_STATUSES.includes(order.status);

  return prisma.$transaction(async (tx) => {
    if (mustRestoreStock) {
      await restoreStock(tx, stockLinesFromOrderItems(order.items));
    }
    return tx.order.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
  });
}
