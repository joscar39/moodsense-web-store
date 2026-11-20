import { NextResponse } from "next/server";

import { cancelExpiredOrder, markOrderPaid } from "@/lib/checkout/fulfill-order";
import { getStripe } from "@/lib/stripe/client";

import type Stripe from "stripe";

/**
 * POST /api/webhooks/stripe: eventos de Stripe. La firma se verifica sobre el
 * body CRUDO antes que nada; firma ausente o inválida → 400.
 * `checkout.session.completed` (pagado) marca el pedido PAID; `expired` lo cancela.
 *
 * @example
 * // Lo llama Stripe con el header `stripe-signature`:
 * // 200 { received: true } · 400 firma ausente/inválida · 500 webhook sin configurar
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!secret) {
    console.error("[stripe] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: { code: "WEBHOOK_NOT_CONFIGURED", message: "Webhook no configurado." } },
      { status: 500 }
    );
  }
  if (!signature) {
    return NextResponse.json(
      { error: { code: "MISSING_SIGNATURE", message: "Falta la firma del webhook." } },
      { status: 400 }
    );
  }

  // Si falla la creación del cliente (falta STRIPE_SECRET_KEY) es un error de
  // configuración, no de firma: no debe caer en la rama 400.
  let stripe: ReturnType<typeof getStripe>;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("[stripe] webhook cannot initialize Stripe client:", error);
    return NextResponse.json(
      { error: { code: "WEBHOOK_NOT_CONFIGURED", message: "Webhook no configurado." } },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_SIGNATURE", message: "Firma del webhook inválida." } },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.payment_status === "paid") {
        await markOrderPaid(session);
      }
      break;
    }
    case "checkout.session.expired": {
      await cancelExpiredOrder(event.data.object);
      break;
    }
    default:
      // Los eventos no manejados se confirman para que Stripe deje de reintentar.
      break;
  }

  return NextResponse.json({ received: true });
}
