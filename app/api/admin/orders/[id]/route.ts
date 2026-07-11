import { NextResponse } from "next/server";

import { updateOrderStatus } from "@/lib/admin/orders";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireAdmin } from "@/lib/auth/require-user";
import { orderStatusUpdateSchema } from "@/lib/validators/admin";

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
