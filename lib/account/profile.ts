import { ApiError } from "@/lib/api/handle-api-error";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

import type { PasswordChangeInput, ProfileInput } from "@/lib/validators/account";

export async function updateProfile(userId: string, input: ProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: { name: input.name },
    select: { id: true, name: true, email: true },
  });
}

/**
 * Changes the password of a credentials user after verifying the current one.
 * OAuth-only accounts (no passwordHash) cannot set a password here.
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
