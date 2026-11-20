import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";
import { restoreStock, stockLinesFromOrderItems } from "@/lib/inventory/stock";

import { canTransition, STOCK_HELD_STATUSES } from "./order-status";

import type { OrderStatus } from "@/lib/generated/prisma/enums";

/**
 * Últimos 100 pedidos para la tabla del admin, opcionalmente filtrados por estado.
 *
 * @example
 * const orders = await listAdminOrders("PENDING_PAYMENT");
 */
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

/**
 * Detalle completo de un pedido (items + cliente) para el admin. `null` si no existe.
 *
 * @example
 * const order = await getAdminOrder(id);
 * if (!order) notFound();
 */
export function getAdminOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { name: true, email: true } } },
  });
}

/**
 * Aplica un cambio de estado manual respetando las transiciones permitidas
 * (404 si no existe, 409 si la transición es inválida). Cancelar un pedido con
 * stock retenido (PENDING_PAYMENT/PAID/…) lo devuelve en la misma transacción;
 * los reembolsos NO devuelven stock (la mercancía puede estar con el cliente).
 *
 * @example
 * await updateOrderStatus(orderId, "SHIPPED"); // { id, status: "SHIPPED" }
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
