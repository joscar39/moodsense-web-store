import { z } from "zod";

import { nameField, optionalText, passwordField } from "./fields";

/**
 * Edición de perfil (PATCH /api/account/profile).
 *
 * @example
 * profileSchema.parse({ name: "  Ana Torres " }); // { name: "Ana Torres" }
 */
export const profileSchema = z.object({
  name: nameField(80, "El nombre no puede superar 80 caracteres."),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/**
 * Cambio de contraseña (POST /api/account/password): la nueva cumple la
 * política y debe ser distinta de la actual.
 *
 * @example
 * passwordChangeSchema.safeParse({ currentPassword: "vieja1234", newPassword: "nueva5678" }).success; // true
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string({ error: "La contraseña actual es obligatoria." })
      .min(1, "La contraseña actual es obligatoria."),
    newPassword: passwordField,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser distinta de la actual.",
    path: ["newPassword"],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

/**
 * Dirección guardada del usuario (POST/PATCH /api/account/addresses).
 * Normaliza el país a mayúsculas y convierte opcionales vacíos en `undefined`.
 *
 * @example
 * addressSchema.parse({ fullName: "Ana", line1: "Calle 1", city: "Santiago", postalCode: "51000", country: "do" });
 * // { ..., country: "DO", isDefault: false }
 */
export const addressSchema = z.object({
  fullName: nameField(120),
  line1: z
    .string({ error: "La dirección es obligatoria." })
    .trim()
    .min(3, "La dirección es obligatoria.")
    .max(160),
  line2: optionalText(160),
  city: z
    .string({ error: "La ciudad es obligatoria." })
    .trim()
    .min(2, "La ciudad es obligatoria.")
    .max(80),
  state: optionalText(80),
  postalCode: z
    .string({ error: "El código postal es obligatorio." })
    .trim()
    .min(3, "Código postal inválido.")
    .max(12, "Código postal inválido."),
  country: z
    .string({ error: "El país es obligatorio." })
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Usa el código de país de 2 letras (ej. DO, US)."),
  phone: optionalText(24),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
/** Tipo del formulario (antes de defaults/transformaciones): con el que trabaja react-hook-form. */
export type AddressFormInput = z.input<typeof addressSchema>;

/**
 * Alta/baja de un producto en la wishlist (POST /api/account/wishlist).
 *
 * @example
 * wishlistToggleSchema.parse({ productId: "cm1abc" });
 */
export const wishlistToggleSchema = z.object({
  productId: z.string({ error: "productId es obligatorio." }).min(1),
});
