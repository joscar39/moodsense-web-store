import { NextResponse } from "next/server";

import { updateProfile } from "@/lib/account/profile";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireUser } from "@/lib/auth/require-user";
import { profileSchema } from "@/lib/validators/account";

/**
 * PATCH /api/account/profile: cambia el nombre del usuario autenticado.
 *
 * @example
 * // PATCH /api/account/profile { name: "Ana" }
 * // 200 { data: { id, name, email } } · 400 validación · 401 sin sesión
 */
export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body: unknown = await request.json();
    const input = profileSchema.parse(body);
    const profile = await updateProfile(user.id, input);
    return NextResponse.json({ data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}
