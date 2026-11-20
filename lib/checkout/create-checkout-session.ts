import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";
import { getStripe } from "@/lib/stripe/client";

import { loadValidatedCart, toOrderItems } from "./validate-cart";

import type { CheckoutInput } from "@/lib/validators/checkout";

const CHECKOUT_EXPIRES_MINUTES = 30;

const SHIPPING_COUNTRIES = ["DO", "US", "ES", "MX", "CO", "PR"] as const;

/**
 * Checkout con Stripe (modo dormido): crea un pedido PENDING con snapshot de
 * precios/SKU tomados de la DB y una Checkout Session hosted para pagarlo.
 * El stock se valida aquí pero solo se descuenta cuando el webhook confirma
 * el pago. Si Stripe falla, el pedido queda CANCELLED (sin huérfanos).
 *
 * Lanza CART_INVALID (400) o INSUFFICIENT_STOCK (409) con detalle por ítem
 * (ver `loadValidatedCart`), y CHECKOUT_FAILED (502) si Stripe no da URL.
 *
 * @example
 * const { url, orderId } = await createCheckoutSession({ items }, user);
 * // redirigir al navegador a `url` (página de pago de Stripe)
 */
export async function createCheckoutSession(
  input: CheckoutInput,
  user: { id: string; email: string } | null
) {
  const { lines, subtotalCents } = await loadValidatedCart(input.items);

  const order = await prisma.order.create({
    data: {
      userId: user?.id ?? null,
      // Checkout de invitado: el email definitivo llega con el webhook.
      email: user?.email ?? "",
      subtotalCents,
      shippingCents: 0,
      taxCents: 0,
      totalCents: subtotalCents,
      items: { create: toOrderItems(lines) },
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
    // No dejar un pedido PENDING huérfano si nunca se llegó a Stripe.
    await prisma.order
      .update({ where: { id: order.id }, data: { status: "CANCELLED" } })
      .catch(() => undefined);
    throw error;
  }
}
