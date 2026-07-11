import { z } from "zod";

/** POST /api/checkout body: only ids and quantities — prices come from the DB. */
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(99),
      })
    )
    .min(1, "El carrito está vacío.")
    .max(50, "Demasiadas líneas en el carrito."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** POST /api/checkout/manual — flujo de pago manual vía WhatsApp. */
export const manualCheckoutSchema = checkoutSchema.extend({
  customer: z.object({
    name: z
      .string({ error: "El nombre es obligatorio." })
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres.")
      .max(120),
    phone: z
      .string({ error: "El teléfono es obligatorio." })
      .trim()
      .regex(/^\+?[0-9\s-]{8,20}$/, "Teléfono inválido (incluye el código de país)."),
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: "Email inválido." }))
      .transform((value) => value.toLowerCase())
      .optional()
      .or(z.literal("").transform(() => undefined)),
  }),
  shipping: z.object({
    line1: z.string({ error: "La dirección es obligatoria." }).trim().min(3).max(160),
    line2: z
      .string()
      .trim()
      .max(160)
      .optional()
      .transform((value) => value || undefined),
    city: z.string({ error: "La ciudad es obligatoria." }).trim().min(2).max(80),
    state: z
      .string()
      .trim()
      .max(80)
      .optional()
      .transform((value) => value || undefined),
    postalCode: z
      .string()
      .trim()
      .max(12)
      .optional()
      .transform((value) => value || undefined),
    country: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, "Usa el código de país de 2 letras (ej. DO).")
      .default("DO"),
  }),
});

export type ManualCheckoutInput = z.infer<typeof manualCheckoutSchema>;

/**
 * Schema del FORMULARIO (sin `items`): el carrito no vive en react-hook-form
 * — se fusiona al enviar. Validar `items` en el cliente haría fallar siempre
 * el submit con "carrito vacío".
 */
export const manualCheckoutFormSchema = manualCheckoutSchema.omit({ items: true });
export type ManualCheckoutFormValues = z.input<typeof manualCheckoutFormSchema>;
