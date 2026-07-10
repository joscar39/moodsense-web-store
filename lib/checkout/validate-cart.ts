import type { CheckoutInput } from "@/lib/validators/checkout";

/** Variant shape needed for validation, as loaded from the DB. */
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

export type ValidatedLine = {
  variantId: string;
  sku: string;
  productName: string;
  variantLabel: string | null;
  unitPriceCents: number;
  quantity: number;
};

export type CartIssue = {
  variantId: string;
  code: "NOT_FOUND" | "INACTIVE" | "INSUFFICIENT_STOCK";
  message: string;
  availableStock?: number;
};

export type CartValidation = {
  lines: ValidatedLine[];
  issues: CartIssue[];
  subtotalCents: number;
};

/** Duplicated variant ids in the payload are merged by summing quantities. */
export function dedupeCheckoutItems(items: CheckoutInput["items"]): CheckoutInput["items"] {
  const byVariant = new Map<string, number>();
  for (const item of items) {
    byVariant.set(item.variantId, (byVariant.get(item.variantId) ?? 0) + item.quantity);
  }
  return [...byVariant.entries()].map(([variantId, quantity]) => ({ variantId, quantity }));
}

/**
 * Validates checkout items against catalog data. Prices are ALWAYS taken from
 * the DB (variant override or product base) — client-sent prices don't exist
 * in the contract. Pure function: the caller loads the variants.
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

    const variantLabel = [variant.color, variant.size].filter(Boolean).join(" · ") || null;

    lines.push({
      variantId: variant.id,
      sku: variant.sku,
      productName: variant.product.name,
      variantLabel,
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
