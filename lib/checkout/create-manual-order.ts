import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";
import { reserveStock } from "@/lib/inventory/stock";
import { buildOrderMessage, notifyOperator } from "@/lib/notifications/whatsapp-notifier";

import { loadValidatedCart, toOrderItems } from "./validate-cart";

import type { ManualCheckoutInput } from "@/lib/validators/checkout";

/** Máximo de pedidos pendientes de pago por teléfono en la última hora (anti-abuso). */
const MAX_PENDING_ORDERS_PER_PHONE_PER_HOUR = 3;

/**
 * Flujo de pago manual (WhatsApp): crea el pedido en PENDING_PAYMENT y
 * RESERVA el stock en la misma transacción atómica. La reserva usa un UPDATE
 * condicional (ver lib/inventory/stock.ts), de modo que dos pedidos
 * concurrentes por la última unidad no pueden sobrevender: el segundo recibe
 * INSUFFICIENT_STOCK (409) y la transacción entera se revierte.
 *
 * La notificación al operador se envía DESPUÉS del commit y nunca bloquea ni
 * revierte el pedido (si falla, queda loggeada para reintento manual).
 *
 * Anti-abuso: como el pedido aparta stock sin pagar, un mismo teléfono no puede
 * tener más de 3 pedidos pendientes creados en la última hora (429). Así nadie
 * puede vaciar el inventario con pedidos falsos.
 *
 * @example
 * const { orderId } = await createManualOrder(
 *   { items: [{ variantId: "v1", quantity: 1 }], customer: { name: "Ana", phone: "+18095550100" },
 *     shipping: { line1: "Calle 1", city: "Santo Domingo", country: "DO" } },
 *   null // invitado; o { id, email } si inició sesión
 * );
 */
export async function createManualOrder(
  input: ManualCheckoutInput,
  user: { id: string; email: string } | null
) {
  const recentPendingOrders = await prisma.order.count({
    where: {
      shippingPhone: input.customer.phone,
      status: "PENDING_PAYMENT",
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recentPendingOrders >= MAX_PENDING_ORDERS_PER_PHONE_PER_HOUR) {
    throw new ApiError(
      "TOO_MANY_ORDERS",
      "Ya tienes varios pedidos pendientes de pago. Escríbenos por WhatsApp para completarlos.",
      429
    );
  }

  const { lines, subtotalCents } = await loadValidatedCart(input.items);

  const order = await prisma.$transaction(async (tx) => {
    // Reserva atómica: si otra transacción ganó la última unidad, esto lanza
    // y el pedido no se crea.
    await reserveStock(
      tx,
      lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity }))
    );

    return tx.order.create({
      data: {
        userId: user?.id ?? null,
        email: input.customer.email ?? user?.email ?? "",
        status: "PENDING_PAYMENT",
        subtotalCents,
        shippingCents: 0,
        taxCents: 0,
        totalCents: subtotalCents,
        shippingFullName: input.customer.name,
        shippingPhone: input.customer.phone,
        shippingLine1: input.shipping.line1,
        shippingLine2: input.shipping.line2 ?? null,
        shippingCity: input.shipping.city,
        shippingState: input.shipping.state ?? null,
        shippingPostalCode: input.shipping.postalCode ?? null,
        shippingCountry: input.shipping.country,
        items: { create: toOrderItems(lines) },
      },
      select: { id: true, totalCents: true },
    });
  });

  const message = buildOrderMessage({
    orderId: order.id,
    customerName: input.customer.name,
    customerPhone: input.customer.phone,
    customerEmail: input.customer.email,
    shipping: [
      input.shipping.line1,
      input.shipping.line2,
      input.shipping.city,
      input.shipping.state,
      input.shipping.postalCode,
      input.shipping.country,
    ]
      .filter(Boolean)
      .join(", "),
    lines: lines.map((line) => ({
      name: line.productName,
      variantLabel: line.variantLabel,
      quantity: line.quantity,
      unitPriceCents: line.unitPriceCents,
    })),
    totalCents: order.totalCents,
  });

  try {
    await notifyOperator(message, order.id);
  } catch (error) {
    console.error(`[whatsapp] fallo al notificar el pedido ${order.id}:`, error);
  }

  return { orderId: order.id };
}
