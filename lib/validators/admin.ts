import { z } from "zod";

import { Gender, OrderStatus } from "@/lib/generated/prisma/enums";

/** Los inputs vacíos de un formulario llegan como "": se tratan como ausentes. */
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const optionalCents = z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).optional());

const adminVariantSchema = z.object({
  /** Presente en variantes existentes (update); ausente en las nuevas. */
  id: z.string().optional(),
  sku: z
    .string({ error: "El SKU es obligatorio." })
    .trim()
    .toUpperCase()
    .min(3, "SKU demasiado corto.")
    .max(40, "SKU demasiado largo.")
    .regex(/^[A-Z0-9-]+$/, "El SKU solo admite letras, números y guiones."),
  size: z.preprocess(emptyToUndefined, z.string().trim().max(12).optional()),
  color: z.preprocess(emptyToUndefined, z.string().trim().max(40).optional()),
  priceCents: optionalCents,
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo.").default(0),
});

const adminImageSchema = z.object({
  url: z.url({ error: "URL de imagen inválida." }),
  alt: z.string().trim().min(2, "El texto alternativo es obligatorio.").max(160),
});

/** Campos idénticos entre el schema de la API (centavos) y el del formulario (USD). */
const productBaseFields = {
  name: z.string({ error: "El nombre es obligatorio." }).trim().min(2).max(120),
  slug: z
    .string({ error: "El slug es obligatorio." })
    .trim()
    .toLowerCase()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug inválido (usa kebab-case)."),
  description: z
    .string({ error: "La descripción es obligatoria." })
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres."),
  gender: z.enum(Gender).default("UNISEX"),
  brandId: z.string({ error: "La marca es obligatoria." }).min(1),
  categoryId: z.string({ error: "La categoría es obligatoria." }).min(1),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  images: z.array(adminImageSchema).max(6, "Máximo 6 imágenes.").default([]),
};

/**
 * Lista de variantes con los límites comunes (1 a 30), para cualquier forma de variante.
 *
 * @example
 * variantList(adminVariantSchema); // z.array(adminVariantSchema).min(1).max(30)
 */
function variantList<T extends z.ZodType>(variant: T) {
  return z
    .array(variant)
    .min(1, "El producto necesita al menos una variante.")
    .max(30, "Máximo 30 variantes.");
}

type ProductRules = {
  price: number;
  compareAt: number | undefined;
  comparePath: string;
  variants: { sku: string; size?: string; color?: string }[];
};

/**
 * Reglas cruzadas compartidas por ambos schemas de producto: el precio de
 * comparación debe superar al precio, y no puede haber SKUs ni combinaciones
 * talla/color repetidas.
 *
 * @example
 * schema.superRefine((data, ctx) =>
 *   checkProductRules(ctx, { price: data.priceCents, compareAt: data.compareAtPriceCents,
 *     comparePath: "compareAtPriceCents", variants: data.variants }));
 */
function checkProductRules(ctx: z.RefinementCtx, rules: ProductRules) {
  const { price, compareAt, comparePath, variants } = rules;
  if (compareAt !== undefined && compareAt <= price) {
    ctx.addIssue({
      code: "custom",
      message: "El precio de comparación debe ser mayor que el precio actual.",
      path: [comparePath],
    });
  }
  if (new Set(variants.map((v) => v.sku)).size !== variants.length) {
    ctx.addIssue({
      code: "custom",
      message: "Hay SKUs duplicados entre variantes.",
      path: ["variants"],
    });
  }
  if (new Set(variants.map((v) => `${v.size ?? ""}|${v.color ?? ""}`)).size !== variants.length) {
    ctx.addIssue({
      code: "custom",
      message: "Hay combinaciones talla/color duplicadas.",
      path: ["variants"],
    });
  }
}

/**
 * Body de POST /api/admin/products y PATCH /api/admin/products/[id] (precios en centavos).
 *
 * @example
 * const input = adminProductSchema.parse(await request.json());
 */
export const adminProductSchema = z
  .object({
    ...productBaseFields,
    priceCents: z.coerce.number({ error: "El precio es obligatorio." }).int().min(1),
    compareAtPriceCents: optionalCents,
    variants: variantList(adminVariantSchema),
  })
  .superRefine((data, ctx) =>
    checkProductRules(ctx, {
      price: data.priceCents,
      compareAt: data.compareAtPriceCents,
      comparePath: "compareAtPriceCents",
      variants: data.variants,
    })
  );

export type AdminProductInput = z.infer<typeof adminProductSchema>;

/**
 * Body de PATCH /api/admin/orders/[id].
 *
 * @example
 * const { status } = orderStatusUpdateSchema.parse({ status: "SHIPPED" });
 */
export const orderStatusUpdateSchema = z.object({
  status: z.enum(OrderStatus),
});

// ---------------------------------------------------------------------------
// Schema del FORMULARIO de producto: la UI trabaja en dólares (39.99) y la API
// en centavos enteros. toAdminProductPayload convierte entre ambos.
// ---------------------------------------------------------------------------

const usd = z.coerce.number({ error: "El precio es obligatorio." }).min(0.01).max(100_000);
const optionalUsd = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(0.01).max(100_000).optional()
);

/**
 * Schema del formulario de producto del admin (precios en USD); mismas reglas
 * que `adminProductSchema`.
 *
 * @example
 * useForm<AdminProductFormValues>({ resolver: zodResolver(adminProductFormSchema) });
 */
export const adminProductFormSchema = z
  .object({
    ...productBaseFields,
    priceUsd: usd,
    compareAtPriceUsd: optionalUsd,
    variants: variantList(
      adminVariantSchema.omit({ priceCents: true }).extend({ priceUsd: optionalUsd })
    ),
  })
  .superRefine((data, ctx) =>
    checkProductRules(ctx, {
      price: data.priceUsd,
      compareAt: data.compareAtPriceUsd,
      comparePath: "compareAtPriceUsd",
      variants: data.variants,
    })
  );

export type AdminProductFormValues = z.input<typeof adminProductFormSchema>;

const usdToCents = (value: number) => Math.round(value * 100);
const optionalUsdToCents = (value: number | undefined) =>
  value !== undefined ? usdToCents(value) : undefined;

/**
 * Convierte los valores validados del formulario (USD) en el payload de la API (centavos).
 *
 * @example
 * toAdminProductPayload(adminProductFormSchema.parse(values));
 * // { ...values, priceCents: 3999, variants: [{ sku, priceCents: undefined, ... }] }
 */
export function toAdminProductPayload(
  form: z.infer<typeof adminProductFormSchema>
): AdminProductInput {
  const { priceUsd, compareAtPriceUsd, variants, ...fields } = form;
  return {
    ...fields,
    priceCents: usdToCents(priceUsd),
    compareAtPriceCents: optionalUsdToCents(compareAtPriceUsd),
    variants: variants.map(({ priceUsd: variantPriceUsd, ...variant }) => ({
      ...variant,
      priceCents: optionalUsdToCents(variantPriceUsd),
    })),
  };
}
