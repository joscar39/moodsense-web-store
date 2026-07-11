import { prisma } from "@/lib/db/prisma";
import { restoreStock, stockLinesFromOrderItems } from "@/lib/inventory/stock";

const DEFAULT_EXPIRY_HOURS = 48;

function expiryHours(): number {
  const parsed = Number(process.env.ORDER_PAYMENT_EXPIRY_HOURS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_EXPIRY_HOURS;
}

/**
 * Barrido de expiración: pasa a EXPIRED los pedidos PENDING_PAYMENT más
 * antiguos que ORDER_PAYMENT_EXPIRY_HOURS y devuelve su stock reservado.
 * Idempotente y barato (no hace nada si no hay vencidos), así que se invoca
 * de forma oportunista al cargar las vistas de pedidos del admin y además
 * puede dispararse por cron (/api/cron/expire-orders) en producción.
 * El updateMany condicional dentro de la transacción evita expirar dos veces
 * el mismo pedido aunque corran dos barridos a la vez.
 */
export async function expireStaleManualOrders(now = new Date()) {
  const cutoff = new Date(now.getTime() - expiryHours() * 60 * 60 * 1000);

  const stale = await prisma.order.findMany({
    where: { status: "PENDING_PAYMENT", createdAt: { lt: cutoff } },
    select: { id: true, items: { select: { variantId: true, quantity: true } } },
  });

  let expired = 0;
  for (const order of stale) {
    await prisma.$transaction(async (tx) => {
      // Solo el barrido que "gana" este update restaura el stock.
      const updated = await tx.order.updateMany({
        where: { id: order.id, status: "PENDING_PAYMENT" },
        data: { status: "EXPIRED" },
      });
      if (updated.count === 1) {
        await restoreStock(tx, stockLinesFromOrderItems(order.items));
        expired += 1;
      }
    });
  }

  if (expired > 0) {
    console.log(`[orders] ${expired} pedido(s) PENDING_PAYMENT expirados y stock restaurado.`);
  }
  return { expired };
}
