import { z } from "zod";

const passwordSchema = z
  .string({ error: "La contraseña es obligatoria." })
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  // bcrypt only uses the first 72 bytes of input.
  .max(72, "La contraseña no puede superar 72 caracteres.")
  .regex(/[a-zA-Z]/, "La contraseña debe incluir al menos una letra.")
  .regex(/\d/, "La contraseña debe incluir al menos un número.");

/** PATCH /api/account/profile */
export const profileSchema = z.object({
  name: z
    .string({ error: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no puede superar 80 caracteres."),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** POST /api/account/password */
export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string({ error: "La contraseña actual es obligatoria." })
      .min(1, "La contraseña actual es obligatoria."),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser distinta de la actual.",
    path: ["newPassword"],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

/** POST/PATCH /api/account/addresses */
export const addressSchema = z.object({
  fullName: z
    .string({ error: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(120),
  line1: z
    .string({ error: "La dirección es obligatoria." })
    .trim()
    .min(3, "La dirección es obligatoria.")
    .max(160),
  line2: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => value || undefined),
  city: z
    .string({ error: "La ciudad es obligatoria." })
    .trim()
    .min(2, "La ciudad es obligatoria.")
    .max(80),
  state: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => value || undefined),
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
  phone: z
    .string()
    .trim()
    .max(24)
    .optional()
    .transform((value) => value || undefined),
  isDefault: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
/** Form-side type (before defaults/transforms) — what react-hook-form works with. */
export type AddressFormInput = z.input<typeof addressSchema>;

/** POST /api/account/wishlist */
export const wishlistToggleSchema = z.object({
  productId: z.string({ error: "productId es obligatorio." }).min(1),
});
