import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";

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

/** Order detail, strictly scoped to its owner (404 otherwise). */
export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) {
    throw new ApiError("NOT_FOUND", "Pedido no encontrado.", 404);
  }
  return order;
}
