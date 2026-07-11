import { ApiError } from "@/lib/api/handle-api-error";

import type { Prisma } from "@/lib/generated/prisma/client";

export type StockLine = { variantId: string; quantity: number };

type Tx = Prisma.TransactionClient;

/**
 * ÚNICO punto de mutación de stock del proyecto (ver .claude/rules.md).
 *
 * Reserva stock de forma atómica dentro de una transacción usando un UPDATE
 * condicional (`WHERE stock >= quantity` + `decrement`). Postgres bloquea la
 * fila durante el UPDATE, así que si dos requests concurrentes compiten por
 * la última unidad, exactamente uno la obtiene: para el otro el UPDATE afecta
 * 0 filas y lanzamos INSUFFICIENT_STOCK (409), lo que revierte la transacción
 * completa (ninguna línea queda medio-reservada). No hace falta
 * SELECT ... FOR UPDATE: el chequeo y el decremento son la misma sentencia.
 */
export async function reserveStock(tx: Tx, lines: StockLine[]) {
  for (const line of lines) {
    const updated = await tx.productVariant.updateMany({
      where: { id: line.variantId, stock: { gte: line.quantity } },
      data: { stock: { decrement: line.quantity } },
    });

    if (updated.count === 0) {
      const variant = await tx.productVariant.findUnique({
        where: { id: line.variantId },
        select: { stock: true, product: { select: { name: true } } },
      });
      throw new ApiError(
        "INSUFFICIENT_STOCK",
        variant
          ? `"${variant.product.name}" ya no está disponible en la cantidad solicitada.`
          : "Un producto del carrito ya no está disponible.",
        409,
        [
          {
            variantId: line.variantId,
            code: "INSUFFICIENT_STOCK",
            message: variant
              ? `"${variant.product.name}" ya no está disponible en la cantidad solicitada.`
              : "Producto no disponible.",
            availableStock: variant?.stock ?? 0,
          },
        ]
      );
    }
  }
}

/** Devuelve stock reservado (cancelaciones, expiraciones). */
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
 * que un underflow no bloquea el fulfillment — se loggea para revisión.
 */
export async function decrementStockBestEffort(tx: Tx, lines: StockLine[], orderId: string) {
  for (const line of lines) {
    const updated = await tx.productVariant.updateMany({
      where: { id: line.variantId, stock: { gte: line.quantity } },
      data: { stock: { decrement: line.quantity } },
    });
    if (updated.count === 0) {
      console.error(
        `[stock] underflow for variant ${line.variantId} on order ${orderId} — needs manual review`
      );
    }
  }
}

/** Extrae las líneas de stock de los items de una orden (ignora variantes borradas). */
export function stockLinesFromOrderItems(
  items: { variantId: string | null; quantity: number }[]
): StockLine[] {
  return items
    .filter((item): item is { variantId: string; quantity: number } => item.variantId !== null)
    .map((item) => ({ variantId: item.variantId, quantity: item.quantity }));
}
