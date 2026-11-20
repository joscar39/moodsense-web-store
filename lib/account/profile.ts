import { ApiError } from "@/lib/api/handle-api-error";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

import type { PasswordChangeInput, ProfileInput } from "@/lib/validators/account";

/**
 * Actualiza el nombre visible del usuario.
 *
 * @example
 * await updateProfile(userId, { name: "Ana Pérez" }); // { id, name, email }
 */
export async function updateProfile(userId: string, input: ProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: { name: input.name },
    select: { id: true, name: true, email: true },
  });
}

/**
 * Cambia la contraseña de un usuario con credenciales tras verificar la actual
 * (400 si no coincide). Las cuentas solo-OAuth (sin passwordHash) no pueden.
 *
 * @example
 * await changePassword(userId, { currentPassword: "vieja123", newPassword: "nueva1234" });
 */
export async function changePassword(userId: string, input: PasswordChangeInput) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user.passwordHash) {
    throw new ApiError(
      "OAUTH_ONLY",
      "Esta cuenta usa inicio de sesión con Google y no tiene contraseña.",
      400
    );
  }

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) {
    throw new ApiError("INVALID_PASSWORD", "La contraseña actual no es correcta.", 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });
}
