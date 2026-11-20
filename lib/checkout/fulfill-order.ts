import { prisma } from "@/lib/db/prisma";
import { decrementStockBestEffort, stockLinesFromOrderItems } from "@/lib/inventory/stock";

import type Stripe from "stripe";

/**
 * Webhook `checkout.session.completed`: marca el pedido como PAID, copia de
 * Stripe el email y la dirección de envío definitivos y descuenta stock, todo
 * en una transacción. Idempotente: un pedido que ya no está PENDING se salta,
 * así los reintentos de Stripe son seguros.
 *
 * @example
 * await markOrderPaid(event.data.object); // { status: "fulfilled" | "already-processed" | "ignored" }
 */
export async function markOrderPaid(session: Stripe.Checkout.Session) {
  const order = await findOrderForSession(session);
  if (!order) {
    console.error(`[stripe] no order found for checkout session ${session.id}`);
    return { status: "ignored" as const };
  }
  if (order.status !== "PENDING") {
    return { status: "already-processed" as const };
  }

  const shipping = session.collected_information?.shipping_details ?? null;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        stripePaymentIntentId: paymentIntentId,
        email: session.customer_details?.email ?? order.email,
        shippingFullName: shipping?.name ?? null,
        shippingLine1: shipping?.address?.line1 ?? null,
        shippingLine2: shipping?.address?.line2 ?? null,
        shippingCity: shipping?.address?.city ?? null,
        shippingState: shipping?.address?.state ?? null,
        shippingPostalCode: shipping?.address?.postal_code ?? null,
        shippingCountry: shipping?.address?.country ?? null,
        shippingPhone: session.customer_details?.phone ?? null,
      },
    });

    // El pago ya ocurrió: nunca bloquear el cumplimiento (el underflow se loggea).
    await decrementStockBestEffort(tx, stockLinesFromOrderItems(order.items), order.id);
  });

  return { status: "fulfilled" as const };
}

/**
 * Webhook `checkout.session.expired`: cancela el pedido PENDING de esa sesión. Idempotente.
 *
 * @example
 * await cancelExpiredOrder(event.data.object); // { status: "cancelled" | "ignored" }
 */
export async function cancelExpiredOrder(session: Stripe.Checkout.Session) {
  const order = await findOrderForSession(session);
  if (!order || order.status !== "PENDING") {
    return { status: "ignored" as const };
  }
  await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  return { status: "cancelled" as const };
}

/** Busca el pedido de una sesión de Stripe por `metadata.orderId` (o, si falta, por id de sesión). */
function findOrderForSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  return prisma.order.findFirst({
    where: orderId ? { id: orderId } : { stripeCheckoutSessionId: session.id },
    include: { items: true },
  });
}
