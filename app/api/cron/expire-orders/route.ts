import { NextResponse } from "next/server";

import { expireStaleManualOrders } from "@/lib/checkout/expire-orders";

/**
 * Endpoint para cron (ej. Vercel Cron) que expira pedidos PENDING_PAYMENT
 * vencidos. Protegido por CRON_SECRET (Authorization: Bearer <secret>).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "No autorizado." } },
      { status: 401 }
    );
  }

  const result = await expireStaleManualOrders();
  return NextResponse.json({ data: result });
}
