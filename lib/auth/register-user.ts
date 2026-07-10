import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";

import { hashPassword } from "./password";

import type { RegisterInput } from "@/lib/validators/auth";

/**
 * Creates a credentials user with a bcrypt-hashed password.
 * Throws ApiError EMAIL_TAKEN (409) if the email is already registered
 * (including OAuth-only accounts, which must sign in with their provider).
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
