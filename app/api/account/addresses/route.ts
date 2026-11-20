import { NextResponse } from "next/server";

import { createAddress } from "@/lib/account/addresses";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireUser } from "@/lib/auth/require-user";
import { addressSchema } from "@/lib/validators/account";

/**
 * POST /api/account/addresses: crea una dirección del usuario autenticado
 * (la primera, o una marcada `isDefault`, pasa a ser la principal).
 *
 * @example
 * // POST /api/account/addresses { fullName, line1, city, postalCode, country: "DO" }
 * // 201 { data: { id, ... } } · 400 validación · 401 sin sesión
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body: unknown = await request.json();
    const input = addressSchema.parse(body);
    const address = await createAddress(user.id, input);
    return NextResponse.json({ data: address }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
