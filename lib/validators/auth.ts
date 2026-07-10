import { z } from "zod";

/** Shared between the register form (client) and POST /api/auth/register. */
export const registerSchema = z.object({
  name: z
    .string({ error: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no puede superar 80 caracteres."),
  email: z
    .string({ error: "El email es obligatorio." })
    .trim()
    .pipe(z.email({ error: "Email inválido." }))
    .transform((value) => value.toLowerCase()),
  password: z
    .string({ error: "La contraseña es obligatoria." })
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    // bcrypt only uses the first 72 bytes of input.
    .max(72, "La contraseña no puede superar 72 caracteres.")
    .regex(/[a-zA-Z]/, "La contraseña debe incluir al menos una letra.")
    .regex(/\d/, "La contraseña debe incluir al menos un número."),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** Shared between the login form (client) and the Credentials provider. */
export const loginSchema = z.object({
  email: z
    .string({ error: "El email es obligatorio." })
    .trim()
    .pipe(z.email({ error: "Email inválido." }))
    .transform((value) => value.toLowerCase()),
  password: z
    .string({ error: "La contraseña es obligatoria." })
    .min(1, "La contraseña es obligatoria."),
});

export type LoginInput = z.infer<typeof loginSchema>;
