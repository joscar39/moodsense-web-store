import { NextResponse } from "next/server";

import { deleteAddress, updateAddress } from "@/lib/account/addresses";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireUser } from "@/lib/auth/require-user";
import { addressSchema } from "@/lib/validators/account";

type Context = { params: Promise<{ id: string }> };

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
