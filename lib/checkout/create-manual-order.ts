import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";
import { reserveStock } from "@/lib/inventory/stock";
import { buildOrderMessage, getWhatsappNotifier } from "@/lib/notifications/whatsapp-notifier";

import { validateCart } from "./validate-cart";

import type { ManualCheckoutInput } from "@/lib/validators/checkout";

/**
 * Flujo de pago manual (WhatsApp): crea el pedido en PENDING_PAYMENT y
 * RESERVA el stock en la misma transacción atómica. La reserva usa un UPDATE
 * condicional (ver lib/inventory/stock.ts), de modo que dos pedidos
 * concurrentes por la última unidad no pueden sobrevender: el segundo recibe
 * INSUFFICIENT_STOCK (409) y la transacción entera se revierte.
 *
 * La notificación al operador se envía DESPUÉS del commit y nunca bloquea ni
 * revierte el pedido (si falla, queda loggeada para reintento manual).
 */
export async function createManualOrder(
  input: ManualCheckoutInput,
  user: { id: string; email: string } | null
) {
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: input.items.map((item) => item.variantId) } },
    select: {
      id: true,
      sku: true,
      size: true,
      color: true,
      priceCents: true,
      stock: true,
      product: { select: { name: true, slug: true, isActive: true, priceCents: true } },
    },
  });

  const { lines, issues, subtotalCents } = validateCart(input.items, variants);

  if (issues.length > 0) {
    const stockOnly = issues.every((issue) => issue.code === "INSUFFICIENT_STOCK");
    throw new ApiError(
      stockOnly ? "INSUFFICIENT_STOCK" : "CART_INVALID",
      stockOnly
        ? "No hay stock suficiente para algunos productos del carrito."
        : "Algunos productos del carrito ya no están disponibles.",
      stockOnly ? 409 : 400,
      issues
    );
  }

  const order = await prisma.$transaction(async (tx) => {
    // Reserva atómica: si otra transacción ganó la última unidad, esto lanza
    // y el pedido no se crea.
    await reserveStock(
      tx,
      lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity }))
    );

    return tx.order.create({
      data: {
        userId: user?.id ?? null,
        email: input.customer.email ?? user?.email ?? "",
        status: "PENDING_PAYMENT",
        subtotalCents,
        shippingCents: 0,
        taxCents: 0,
        totalCents: subtotalCents,
        shippingFullName: input.customer.name,
        shippingPhone: input.customer.phone,
        shippingLine1: input.shipping.line1,
        shippingLine2: input.shipping.line2 ?? null,
        shippingCity: input.shipping.city,
        shippingState: input.shipping.state ?? null,
        shippingPostalCode: input.shipping.postalCode ?? null,
        shippingCountry: input.shipping.country,
        items: {
          create: lines.map((line) => ({
            variantId: line.variantId,
            productName: line.productName,
            variantLabel: line.variantLabel,
            sku: line.sku,
            unitPriceCents: line.unitPriceCents,
            quantity: line.quantity,
          })),
        },
      },
      select: { id: true, totalCents: true },
    });
  });

  const message = buildOrderMessage({
    orderId: order.id,
    customerName: input.customer.name,
    customerPhone: input.customer.phone,
    customerEmail: input.customer.email,
    shipping: [
      input.shipping.line1,
      input.shipping.line2,
      input.shipping.city,
      input.shipping.state,
      input.shipping.postalCode,
      input.shipping.country,
    ]
      .filter(Boolean)
      .join(", "),
    lines: lines.map((line) => ({
      name: line.productName,
      variantLabel: line.variantLabel,
      quantity: line.quantity,
      unitPriceCents: line.unitPriceCents,
    })),
    totalCents: order.totalCents,
  });

  try {
    await getWhatsappNotifier().sendToOperator(message);
  } catch (error) {
    console.error(`[whatsapp] fallo al notificar el pedido ${order.id}:`, error);
  }

  return { orderId: order.id };
}
