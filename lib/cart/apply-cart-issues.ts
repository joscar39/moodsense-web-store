/** Problema por ítem que devuelven los endpoints de checkout en `error.details`. */
type CheckoutIssue = {
  variantId: string;
  code: string;
  message: string;
  availableStock?: number;
};

type CartActions = {
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
};

/**
 * Procesa una respuesta de error de un checkout (400/409): ajusta el carrito a
 * la disponibilidad real (baja cantidades sin stock, quita productos que ya no
 * existen) y devuelve los mensajes a mostrar al usuario.
 *
 * Para qué: que el usuario pueda reintentar el pedido sin corregir el carrito a mano.
 * Si la respuesta no trae detalle por ítem devuelve su mensaje, o `fallbackMessage`.
 *
 * @example
 * if (!response.ok) {
 *   const messages = await applyCartIssues(response, { setQuantity, removeItem }, "No se pudo crear el pedido.");
 *   messages.forEach((message) => toast.error(message));
 * }
 */
export async function applyCartIssues(
  response: Response,
  cart: CartActions,
  fallbackMessage: string
): Promise<string[]> {
  const body: unknown = await response.json().catch(() => null);
  const error = (body as { error?: { message?: string; details?: unknown } } | null)?.error;
  const issues = Array.isArray(error?.details) ? (error.details as CheckoutIssue[]) : [];

  for (const issue of issues) {
    if (issue.code === "INSUFFICIENT_STOCK") {
      cart.setQuantity(issue.variantId, issue.availableStock ?? 0);
    }
    if (issue.code === "NOT_FOUND" || issue.code === "INACTIVE") {
      cart.removeItem(issue.variantId);
    }
  }

  return issues.length > 0
    ? issues.map((issue) => issue.message)
    : [error?.message ?? fallbackMessage];
}
