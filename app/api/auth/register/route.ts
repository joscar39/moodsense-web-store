import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { registerUser } from "@/lib/auth/register-user";
import { registerSchema } from "@/lib/validators/auth";

/**
 * POST /api/auth/register: crea una cuenta con email y contraseña.
 *
 * @example
 * fetch("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) })
 * // 201 { data: { id, name, email, role } } · 400 datos inválidos · 409 email ya registrado
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = registerSchema.parse(body);
    const user = await registerUser(input);
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
