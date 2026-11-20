import { NextResponse } from "next/server";

import { changePassword } from "@/lib/account/profile";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireUser } from "@/lib/auth/require-user";
import { passwordChangeSchema } from "@/lib/validators/account";

/**
 * POST /api/account/password: cambia la contraseña verificando la actual.
 *
 * @example
 * // POST /api/account/password { currentPassword, newPassword }
 * // 200 { data: { updated: true } } · 400 (actual incorrecta / solo Google) · 401
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body: unknown = await request.json();
    const input = passwordChangeSchema.parse(body);
    await changePassword(user.id, input);
    return NextResponse.json({ data: { updated: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
