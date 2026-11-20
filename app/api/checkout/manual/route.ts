import { NextResponse } from "next/server";

import { handleApiError, ApiError } from "@/lib/api/handle-api-error";
import { getOptionalUser } from "@/lib/auth/require-user";
import { createManualOrder } from "@/lib/checkout/create-manual-order";
import { orderAccessCookieName } from "@/lib/checkout/order-access";
import { manualCheckoutSchema } from "@/lib/validators/checkout";

/**
 * POST /api/checkout/manual: crea un pedido "pendiente de pago" (modo WhatsApp).
 *
 * Además deja en el navegador del comprador una cookie privada que le permite
 * ver la página de confirmación de ESE pedido (nadie más puede verla).
 *
 * @example
 * fetch("/api/checkout/manual", { method: "POST", body: JSON.stringify({ items, customer, shipping }) })
 * // 201 { data: { orderId } } · 400 datos inválidos · 409 sin stock · 429 demasiados pedidos
 */
export async function POST(request: Request) {
  try {
    if (process.env.NEXT_PUBLIC_CHECKOUT_MODE === "stripe") {
      throw new ApiError("CHECKOUT_MODE", "El checkout manual no está activo.", 409);
    }

    const body: unknown = await request.json();
    const input = manualCheckoutSchema.parse(body);

    const result = await createManualOrder(input, await getOptionalUser());

    const response = NextResponse.json({ data: result }, { status: 201 });
    response.cookies.set(orderAccessCookieName(result.orderId), "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/checkout/confirmation",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
