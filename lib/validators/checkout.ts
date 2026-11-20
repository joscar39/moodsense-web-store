import { z } from "zod";

import { MAX_QUANTITY_PER_LINE } from "@/lib/cart/cart-logic";

import { emailField, nameField, optionalText } from "./fields";

/**
 * Body de POST /api/checkout (Stripe): solo ids y cantidades; los precios
 * salen de la DB.
 *
 * @example
 * checkoutSchema.parse({ items: [{ variantId: "v1", quantity: 2 }] });
 */
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(MAX_QUANTITY_PER_LINE),
      })
    )
    .min(1, "El carrito está vacío.")
    .max(50, "Demasiadas líneas en el carrito."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Body de POST /api/checkout/manual (pago manual vía WhatsApp): carrito +
 * datos de contacto y envío. El email es opcional ("" se trata como ausente).
 *
 * @example
 * manualCheckoutSchema.parse({
 *   items: [{ variantId: "v1", quantity: 1 }],
 *   customer: { name: "Ana", phone: "+1 809 555 0100", email: "" },
 *   shipping: { line1: "Calle 1", city: "Santo Domingo" }, // country → "DO"
 * });
 */
export const manualCheckoutSchema = checkoutSchema.extend({
  customer: z.object({
    name: nameField(120),
    phone: z
      .string({ error: "El teléfono es obligatorio." })
      .trim()
      .regex(/^\+?[0-9\s-]{8,20}$/, "Teléfono inválido (incluye el código de país)."),
    email: emailField.optional().or(z.literal("").transform(() => undefined)),
  }),
  shipping: z.object({
    line1: z.string({ error: "La dirección es obligatoria." }).trim().min(3).max(160),
    line2: optionalText(160),
    city: z.string({ error: "La ciudad es obligatoria." }).trim().min(2).max(80),
    state: optionalText(80),
    postalCode: optionalText(12),
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
 * Schema del FORMULARIO de checkout manual (sin `items`): el carrito no vive
 * en react-hook-form, se fusiona al enviar. Validar `items` en el cliente
 * haría fallar siempre el submit con "carrito vacío".
 *
 * @example
 * useForm<ManualCheckoutFormValues>({ resolver: zodResolver(manualCheckoutFormSchema) });
 */
export const manualCheckoutFormSchema = manualCheckoutSchema.omit({ items: true });
export type ManualCheckoutFormValues = z.input<typeof manualCheckoutFormSchema>;
