import { prisma } from "@/lib/db/prisma";

import type Stripe from "stripe";

/**
 * Marks the order behind a completed Checkout Session as PAID, copies the
 * definitive email + shipping address snapshot from Stripe and decrements
 * stock — all in one transaction. Idempotent: a non-PENDING order is skipped,
 * so webhook retries are safe.
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

    for (const item of order.items) {
      if (!item.variantId) continue;
      const updated = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        // Payment already happened; never block fulfillment. Flag for review.
        console.error(
          `[stripe] stock underflow for variant ${item.variantId} on order ${order.id} — needs manual review`
        );
      }
    }
  });

  return { status: "fulfilled" as const };
}

/** Cancels the PENDING order of an expired Checkout Session. Idempotent. */
export async function cancelExpiredOrder(session: Stripe.Checkout.Session) {
  const order = await findOrderForSession(session);
  if (!order || order.status !== "PENDING") {
    return { status: "ignored" as const };
  }
  await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  return { status: "cancelled" as const };
}

function findOrderForSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  return prisma.order.findFirst({
    where: orderId ? { id: orderId } : { stripeCheckoutSessionId: session.id },
    include: { items: true },
  });
}
