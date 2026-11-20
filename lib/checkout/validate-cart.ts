import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";
import { variantLabel } from "@/lib/format/variant-label";

import type { CheckoutInput } from "@/lib/validators/checkout";

/** Forma de la variante que necesita la validación, tal como se carga de la DB. */
export type CatalogVariant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  priceCents: number | null;
  stock: number;
  product: {
    name: string;
    slug: string;
    isActive: boolean;
    priceCents: number;
  };
};

type ValidatedLine = {
  variantId: string;
  sku: string;
  productName: string;
  variantLabel: string | null;
  unitPriceCents: number;
  quantity: number;
};

type CartIssue = {
  variantId: string;
  code: "NOT_FOUND" | "INACTIVE" | "INSUFFICIENT_STOCK";
  message: string;
  availableStock?: number;
};

type CartValidation = {
  lines: ValidatedLine[];
  issues: CartIssue[];
  subtotalCents: number;
};

/**
 * Une las líneas repetidas del carrito sumando cantidades por variante.
 * Para qué: que un payload con la misma variante dos veces no esquive el
 * chequeo de stock.
 *
 * @example
 * dedupeCheckoutItems([{ variantId: "v1", quantity: 2 }, { variantId: "v1", quantity: 3 }]);
 * // [{ variantId: "v1", quantity: 5 }]
 */
export function dedupeCheckoutItems(items: CheckoutInput["items"]): CheckoutInput["items"] {
  const byVariant = new Map<string, number>();
  for (const item of items) {
    byVariant.set(item.variantId, (byVariant.get(item.variantId) ?? 0) + item.quantity);
  }
  return [...byVariant.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
}

/**
 * Valida los ítems del checkout contra el catálogo. Los precios SIEMPRE salen
 * de la DB (precio de la variante o, si no tiene, el del producto): el cliente
 * nunca envía precios. Función pura: quien la llama carga las variantes.
 *
 * @example
 * const { lines, issues, subtotalCents } = validateCart([{ variantId: "v1", quantity: 2 }], variants);
 * // issues vacío si todo está disponible; si no, un aviso por variante con problema
 */
export function validateCart(
  items: CheckoutInput["items"],
  variants: CatalogVariant[]
): CartValidation {
  const byId = new Map(variants.map((variant) => [variant.id, variant]));
  const lines: ValidatedLine[] = [];
  const issues: CartIssue[] = [];

  for (const item of dedupeCheckoutItems(items)) {
    const variant = byId.get(item.variantId);

    if (!variant) {
      issues.push({
        variantId: item.variantId,
        code: "NOT_FOUND",
        message: "El producto ya no está disponible.",
      });
      continue;
    }

    if (!variant.product.isActive) {
      issues.push({
        variantId: item.variantId,
        code: "INACTIVE",
        message: `"${variant.product.name}" ya no está disponible.`,
      });
      continue;
    }

    if (variant.stock < item.quantity) {
      issues.push({
        variantId: item.variantId,
        code: "INSUFFICIENT_STOCK",
        message:
          variant.stock === 0
            ? `"${variant.product.name}" está agotado.`
            : `Solo quedan ${variant.stock} unidades de "${variant.product.name}".`,
        availableStock: variant.stock,
      });
      continue;
    }

    lines.push({
      variantId: variant.id,
      sku: variant.sku,
      productName: variant.product.name,
      variantLabel: variantLabel(variant.color, variant.size),
      unitPriceCents: variant.priceCents ?? variant.product.priceCents,
      quantity: item.quantity,
    });
  }

  return {
    lines,
    issues,
    subtotalCents: lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0),
  };
}

/**
 * Carga de la DB las variantes del carrito, las valida y lanza si hay problemas.
 * Lo usan los dos checkouts (WhatsApp y Stripe) antes de crear el pedido.
 *
 * Lanza `ApiError` con los problemas por ítem en `details`:
 * - INSUFFICIENT_STOCK (409) si el único problema es la cantidad disponible.
 * - CART_INVALID (400) si algún producto no existe o está inactivo.
 *
 * @example
 * const { lines, subtotalCents } = await loadValidatedCart(input.items);
 */
export async function loadValidatedCart(items: CheckoutInput["items"]) {
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: items.map((item) => item.variantId) } },
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

  const { lines, issues, subtotalCents } = validateCart(items, variants);

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

  return { lines, subtotalCents };
}

/**
 * Convierte las líneas validadas en los `OrderItem` a crear: snapshot de
 * nombre, variante, SKU y precio al momento de la compra.
 *
 * @example
 * await prisma.order.create({ data: { ...datos, items: { create: toOrderItems(lines) } } });
 */
export function toOrderItems(lines: ValidatedLine[]) {
  return lines.map((line) => ({
    variantId: line.variantId,
    productName: line.productName,
    variantLabel: line.variantLabel,
    sku: line.sku,
    unitPriceCents: line.unitPriceCents,
    quantity: line.quantity,
  }));
}
