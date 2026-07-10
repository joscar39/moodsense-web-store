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
