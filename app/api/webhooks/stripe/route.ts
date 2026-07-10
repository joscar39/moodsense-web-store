import { NextResponse } from "next/server";

import { cancelExpiredOrder, markOrderPaid } from "@/lib/checkout/fulfill-order";
import { getStripe } from "@/lib/stripe/client";

import type Stripe from "stripe";

/**
 * Stripe webhook. The signature is verified against the RAW body before
 * anything else — an invalid or missing signature is rejected with 400.
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

  // Instantiation failures (missing STRIPE_SECRET_KEY) are config errors,
  // not signature errors — keep them out of the 400 branch.
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
      // Unhandled event types are acknowledged so Stripe stops retrying.
      break;
  }

  return NextResponse.json({ received: true });
}
