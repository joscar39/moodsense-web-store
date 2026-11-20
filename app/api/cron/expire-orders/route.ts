import { NextResponse } from "next/server";

import { expireStaleManualOrders } from "@/lib/checkout/expire-orders";

/**
 * GET /api/cron/expire-orders: endpoint para cron (ej. Vercel Cron) que expira
 * pedidos PENDING_PAYMENT vencidos y devuelve su stock. Protegido por CRON_SECRET.
 *
 * @example
 * fetch("/api/cron/expire-orders", { headers: { Authorization: `Bearer ${CRON_SECRET}` } })
 * // 200 { data: { expired: 2 } } · 401 secreto ausente o incorrecto
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
