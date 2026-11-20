import { ApiError } from "@/lib/api/handle-api-error";

import type { Prisma } from "@/lib/generated/prisma/client";

type StockLine = { variantId: string; quantity: number };

type Tx = Prisma.TransactionClient;

/**
 * Intenta descontar `quantity` unidades de una variante con un UPDATE
 * condicional atómico (`WHERE stock >= quantity`). Devuelve `false` si no
 * había stock suficiente (0 filas afectadas); nunca deja el stock en negativo.
 *
 * @example
 * const ok = await tryDecrement(tx, { variantId: "v1", quantity: 2 });
 */
async function tryDecrement(tx: Tx, line: StockLine): Promise<boolean> {
  const updated = await tx.productVariant.updateMany({
    where: { id: line.variantId, stock: { gte: line.quantity } },
    data: { stock: { decrement: line.quantity } },
  });
  return updated.count > 0;
}

/**
 * ÚNICO punto de mutación de stock del proyecto (ver `.agents/rules/convenciones.md`).
 *
 * Reserva stock de forma atómica dentro de una transacción usando un UPDATE
 * condicional (`WHERE stock >= quantity` + `decrement`). Postgres bloquea la
 * fila durante el UPDATE, así que si dos requests concurrentes compiten por
 * la última unidad, exactamente uno la obtiene: para el otro el UPDATE afecta
 * 0 filas y lanzamos INSUFFICIENT_STOCK (409), lo que revierte la transacción
 * completa (ninguna línea queda medio-reservada). No hace falta
 * SELECT ... FOR UPDATE: el chequeo y el decremento son la misma sentencia.
 *
 * @example
 * await prisma.$transaction(async (tx) => {
 *   await reserveStock(tx, [{ variantId: "v1", quantity: 2 }]); // 409 si no alcanza
 *   await tx.order.create({ ... });
 * });
 */
export async function reserveStock(tx: Tx, lines: StockLine[]) {
  for (const line of lines) {
    if (await tryDecrement(tx, line)) continue;

    const variant = await tx.productVariant.findUnique({
      where: { id: line.variantId },
      select: { stock: true, product: { select: { name: true } } },
    });
    const message = variant
      ? `"${variant.product.name}" ya no está disponible en la cantidad solicitada.`
      : null;
    throw new ApiError(
      "INSUFFICIENT_STOCK",
      message ?? "Un producto del carrito ya no está disponible.",
      409,
      [
        {
          variantId: line.variantId,
          code: "INSUFFICIENT_STOCK",
          message: message ?? "Producto no disponible.",
          availableStock: variant?.stock ?? 0,
        },
      ]
    );
  }
}

/**
 * Devuelve stock reservado al inventario (cancelaciones, expiraciones).
 *
 * @example
 * await restoreStock(tx, stockLinesFromOrderItems(order.items));
 */
export async function restoreStock(tx: Tx, lines: StockLine[]) {
  for (const line of lines) {
    await tx.productVariant.update({
      where: { id: line.variantId },
      data: { stock: { increment: line.quantity } },
    });
  }
}

/**
 * Decremento best-effort para el webhook de Stripe: el pago ya ocurrió, así
 * que un underflow no bloquea el fulfillment — se loggea para revisión manual.
 *
 * @example
 * await decrementStockBestEffort(tx, stockLinesFromOrderItems(order.items), order.id);
 */
export async function decrementStockBestEffort(tx: Tx, lines: StockLine[], orderId: string) {
  for (const line of lines) {
    if (!(await tryDecrement(tx, line))) {
      console.error(
        `[stock] underflow for variant ${line.variantId} on order ${orderId} — needs manual review`
      );
    }
  }
}

/**
 * Extrae las líneas de stock de los items de una orden (ignora variantes borradas,
 * cuyo `variantId` quedó en null por el `SetNull`).
 *
 * @example
 * stockLinesFromOrderItems([{ variantId: "v1", quantity: 2 }, { variantId: null, quantity: 1 }]);
 * // [{ variantId: "v1", quantity: 2 }]
 */
export function stockLinesFromOrderItems(
  items: { variantId: string | null; quantity: number }[]
): StockLine[] {
  return items
    .filter((item): item is { variantId: string; quantity: number } => item.variantId !== null)
    .map((item) => ({ variantId: item.variantId, quantity: item.quantity }));
}
