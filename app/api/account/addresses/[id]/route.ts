import { NextResponse } from "next/server";

import { deleteAddress, updateAddress } from "@/lib/account/addresses";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireUser } from "@/lib/auth/require-user";
import { addressSchema } from "@/lib/validators/account";

type Context = { params: Promise<{ id: string }> };

/**
 * PATCH /api/account/addresses/[id]: actualiza una dirección propia.
 *
 * @example
 * // PATCH /api/account/addresses/a1 { ...dirección, isDefault: true }
 * // 200 { data: { id, ... } } · 400 · 401 · 404 (ajena o inexistente)
 */
export async function PATCH(request: Request, context: Context) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const body: unknown = await request.json();
    const input = addressSchema.parse(body);
    const address = await updateAddress(user.id, id, input);
    return NextResponse.json({ data: address });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/account/addresses/[id]: borra una dirección propia (promueve otra
 * a principal si hacía falta).
 *
 * @example
 * // DELETE /api/account/addresses/a1 → 200 { data: { deleted: true } } · 401 · 404
 */
export async function DELETE(_request: Request, context: Context) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    await deleteAddress(user.id, id);
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
