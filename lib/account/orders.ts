import { prisma } from "@/lib/db/prisma";

/**
 * Pedidos del usuario, del más reciente al más antiguo, para "Mis pedidos".
 *
 * @example
 * const orders = await listOrders(session.user.id);
 */
export function listOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      totalCents: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });
}

/**
 * Detalle de un pedido, estrictamente scoped a su dueño: devuelve `null` si no
 * existe o es de otro usuario (la página responde 404, sin revelar existencia).
 *
 * @example
 * const order = await getOrder(session.user.id, id);
 * if (!order) notFound();
 */
export function getOrder(userId: string, orderId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
}
