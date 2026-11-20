import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";

import { hashPassword } from "./password";

import type { RegisterInput } from "@/lib/validators/auth";

/**
 * Crea un usuario de credenciales con la contraseña hasheada (bcrypt).
 * Lanza EMAIL_TAKEN (409) si el email ya existe, incluidas cuentas solo-OAuth
 * (que deben entrar con su provider).
 *
 * @example
 * const user = await registerUser({ name: "Ana", email: "ana@example.com", password: "segura1234" });
 * // { id, name, email, role }
 */
export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError("EMAIL_TAKEN", "Ya existe una cuenta con este email.", 409);
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
    },
    select: { id: true, name: true, email: true, role: true },
  });
}
