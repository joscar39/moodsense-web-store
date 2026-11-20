import { NextResponse } from "next/server";

import { updateOrderStatus } from "@/lib/admin/orders";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireAdmin } from "@/lib/auth/require-user";
import { orderStatusUpdateSchema } from "@/lib/validators/admin";

/**
 * PATCH /api/admin/orders/[id] (solo ADMIN): cambia el estado de un pedido
 * según la máquina de transiciones (cancelar devuelve stock si estaba retenido).
 *
 * @example
 * // PATCH /api/admin/orders/ord_1 { status: "SHIPPED" }
 * // 200 { data: { id, status } } · 400 · 403 · 404 · 409 transición inválida
 */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body: unknown = await request.json();
    const { status } = orderStatusUpdateSchema.parse(body);
    const order = await updateOrderStatus(id, status);
    return NextResponse.json({ data: order });
  } catch (error) {
    return handleApiError(error);
  }
}
