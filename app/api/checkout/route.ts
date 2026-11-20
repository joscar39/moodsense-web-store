import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { getOptionalUser } from "@/lib/auth/require-user";
import { createCheckoutSession } from "@/lib/checkout/create-checkout-session";
import { checkoutSchema } from "@/lib/validators/checkout";

/**
 * POST /api/checkout: inicia el pago con Stripe (lo usa el carrito con NEXT_PUBLIC_CHECKOUT_MODE="stripe").
 * Acepta invitados; si hay sesión, asocia el pedido al usuario.
 *
 * @example
 * fetch("/api/checkout", { method: "POST", body: JSON.stringify({ items }) })
 * // 200 { data: { url, orderId } } · 400 datos inválidos/producto no disponible · 409 sin stock · 502 Stripe falló
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = checkoutSchema.parse(body);
    const result = await createCheckoutSession(input, await getOptionalUser());
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
