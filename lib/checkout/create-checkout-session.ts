import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";
import { getStripe } from "@/lib/stripe/client";

import { validateCart } from "./validate-cart";

import type { CheckoutInput } from "@/lib/validators/checkout";

const CHECKOUT_EXPIRES_MINUTES = 30;

const SHIPPING_COUNTRIES = ["DO", "US", "ES", "MX", "CO", "PR"] as const;

/**
 * Creates a PENDING order (with price/SKU snapshots taken from the DB) and a
 * Stripe Checkout Session for it. Stock is validated here but only decremented
 * when the webhook confirms payment. Returns the hosted checkout URL.
 *
 * Throws:
 * - CART_INVALID (400) when items are unknown/inactive, with per-item details.
 * - INSUFFICIENT_STOCK (409) when quantities exceed stock, with availability.
 */
export async function createCheckoutSession(
  input: CheckoutInput,
  user: { id: string; email: string } | null
) {
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: input.items.map((item) => item.variantId) } },
    select: {
      id: true,
      sku: true,
      size: true,
      color: true,
      priceCents: true,
      stock: true,
      product: { select: { name: true, slug: true, isActive: true, priceCents: true } },
    },
  });

  const { lines, issues, subtotalCents } = validateCart(input.items, variants);

  if (issues.length > 0) {
    const stockOnly = issues.every((issue) => issue.code === "INSUFFICIENT_STOCK");
    throw new ApiError(
      stockOnly ? "INSUFFICIENT_STOCK" : "CART_INVALID",
      stockOnly
        ? "No hay stock suficiente para algunos productos del carrito."
        : "Algunos productos del carrito ya no están disponibles.",
      stockOnly ? 409 : 400,
      issues
    );
  }

  const order = await prisma.order.create({
    data: {
      userId: user?.id ?? null,
      // Guest checkout: the definitive email arrives with the webhook.
      email: user?.email ?? "",
      subtotalCents,
      shippingCents: 0,
      taxCents: 0,
      totalCents: subtotalCents,
      items: {
        create: lines.map((line) => ({
          variantId: line.variantId,
          productName: line.productName,
          variantLabel: line.variantLabel,
          sku: line.sku,
          unitPriceCents: line.unitPriceCents,
          quantity: line.quantity,
        })),
      },
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: line.unitPriceCents,
          product_data: {
            name: line.productName,
            ...(line.variantLabel && { description: line.variantLabel }),
          },
        },
      })),
      metadata: { orderId: order.id },
      ...(user?.email && { customer_email: user.email }),
      shipping_address_collection: { allowed_countries: [...SHIPPING_COUNTRIES] },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRES_MINUTES * 60,
    });

    if (!session.url) {
      throw new ApiError("CHECKOUT_FAILED", "No se pudo iniciar el pago.", 502);
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    return { url: session.url, orderId: order.id };
  } catch (error) {
    // Don't leave an orphan PENDING order if Stripe was never reached.
    await prisma.order
      .update({ where: { id: order.id }, data: { status: "CANCELLED" } })
      .catch(() => undefined);
    throw error;
  }
}
