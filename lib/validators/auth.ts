import { z } from "zod";

import { emailField, nameField, passwordField } from "./fields";

/**
 * Datos de registro. Lo comparten el formulario (cliente) y POST /api/auth/register.
 *
 * @example
 * registerSchema.parse({ name: "Ana", email: "Ana@Example.com", password: "segura1234" });
 * // { name: "Ana", email: "ana@example.com", password: "segura1234" }
 */
export const registerSchema = z.object({
  name: nameField(80, "El nombre no puede superar 80 caracteres."),
  email: emailField,
  password: passwordField,
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Credenciales de login. Lo comparten el formulario (cliente) y el provider
 * Credentials de Auth.js. Aquí no se aplica la política de contraseña: solo
 * se exige que no esté vacía.
 *
 * @example
 * loginSchema.parse({ email: "USER@example.com", password: "x" }); // email en minúsculas
 */
export const loginSchema = z.object({
  email: emailField,
  password: z
    .string({ error: "La contraseña es obligatoria." })
    .min(1, "La contraseña es obligatoria."),
});

export type LoginInput = z.infer<typeof loginSchema>;
