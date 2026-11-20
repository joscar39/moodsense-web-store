import { z } from "zod";

/**
 * Campos Zod reutilizados por varios schemas (registro, login, cuenta,
 * checkout). Centralizarlos evita que las reglas y mensajes se desalineen.
 */

/**
 * Email obligatorio: recorta espacios, valida el formato y lo pasa a minúsculas.
 *
 * @example
 * z.object({ email: emailField }).parse({ email: " Ana@Example.com " }); // { email: "ana@example.com" }
 */
export const emailField = z
  .string({ error: "El email es obligatorio." })
  .trim()
  .pipe(z.email({ error: "Email inválido." }))
  .transform((value) => value.toLowerCase());

/**
 * Política de contraseña nueva: 8–72 caracteres con al menos una letra y un número.
 * El tope de 72 es porque bcrypt solo usa los primeros 72 bytes.
 *
 * @example
 * passwordField.safeParse("segura1234").success; // true
 * passwordField.safeParse("12345678").success;   // false (sin letras)
 */
export const passwordField = z
  .string({ error: "La contraseña es obligatoria." })
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(72, "La contraseña no puede superar 72 caracteres.")
  .regex(/[a-zA-Z]/, "La contraseña debe incluir al menos una letra.")
  .regex(/\d/, "La contraseña debe incluir al menos un número.");

/**
 * Nombre de persona obligatorio (mínimo 2 caracteres, recortado), con largo
 * máximo configurable y mensaje opcional para cuando se supera.
 *
 * @example
 * nameField(80, "El nombre no puede superar 80 caracteres.").parse("  Ana "); // "Ana"
 */
export function nameField(max: number, maxMessage?: string) {
  return z
    .string({ error: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(max, maxMessage);
}

/**
 * Texto opcional recortado y con largo máximo; un string vacío se convierte en
 * `undefined` (los formularios envían "" en los campos que se dejan en blanco).
 *
 * @example
 * optionalText(80).parse("");      // undefined
 * optionalText(80).parse(" Sur "); // "Sur"
 */
export function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);
}
