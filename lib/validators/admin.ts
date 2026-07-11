import { z } from "zod";

import { Gender, OrderStatus } from "@/lib/generated/prisma/enums";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const optionalCents = z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).optional());

export const adminVariantSchema = z.object({
  /** Present for existing variants (update); absent for new ones. */
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

export const adminImageSchema = z.object({
  url: z.url({ error: "URL de imagen inválida." }),
  alt: z.string().trim().min(2, "El texto alternativo es obligatorio.").max(160),
});

/** Fields shared verbatim between the API schema (cents) and the form schema (USD). */
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
};

export const adminProductSchema = z
  .object({
    ...productBaseFields,
    priceCents: z.coerce.number({ error: "El precio es obligatorio." }).int().min(1),
    compareAtPriceCents: optionalCents,
    images: z.array(adminImageSchema).max(6, "Máximo 6 imágenes.").default([]),
    variants: z
      .array(adminVariantSchema)
      .min(1, "El producto necesita al menos una variante.")
      .max(30, "Máximo 30 variantes."),
  })
  .refine(
    (data) => data.compareAtPriceCents === undefined || data.compareAtPriceCents > data.priceCents,
    {
      message: "El precio de comparación debe ser mayor que el precio actual.",
      path: ["compareAtPriceCents"],
    }
  )
  .refine((data) => new Set(data.variants.map((v) => v.sku)).size === data.variants.length, {
    message: "Hay SKUs duplicados entre variantes.",
    path: ["variants"],
  })
  .refine(
    (data) =>
      new Set(data.variants.map((v) => `${v.size ?? ""}|${v.color ?? ""}`)).size ===
      data.variants.length,
    { message: "Hay combinaciones talla/color duplicadas.", path: ["variants"] }
  );

export type AdminProductInput = z.infer<typeof adminProductSchema>;
export type AdminProductFormInput = z.input<typeof adminProductSchema>;

export const orderStatusUpdateSchema = z.object({
  status: z.enum(OrderStatus),
});

export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;

// ---------------------------------------------------------------------------
// Admin product FORM schema: the UI works in dollars (39.99); the API works
// in integer cents. toAdminProductPayload converts between them.
// ---------------------------------------------------------------------------

const usd = z.coerce.number({ error: "El precio es obligatorio." }).min(0.01).max(100_000);
const optionalUsd = z.preprocess(
  emptyToUndefined,
  z.coerce.number().min(0.01).max(100_000).optional()
);

export const adminProductFormSchema = z
  .object({
    ...productBaseFields,
    priceUsd: usd,
    compareAtPriceUsd: optionalUsd,
    images: z.array(adminImageSchema).max(6, "Máximo 6 imágenes.").default([]),
    variants: z
      .array(adminVariantSchema.omit({ priceCents: true }).extend({ priceUsd: optionalUsd }))
      .min(1, "El producto necesita al menos una variante.")
      .max(30, "Máximo 30 variantes."),
  })
  .refine(
    (data) => data.compareAtPriceUsd === undefined || data.compareAtPriceUsd > data.priceUsd,
    {
      message: "El precio de comparación debe ser mayor que el precio actual.",
      path: ["compareAtPriceUsd"],
    }
  )
  .refine((data) => new Set(data.variants.map((v) => v.sku)).size === data.variants.length, {
    message: "Hay SKUs duplicados entre variantes.",
    path: ["variants"],
  });

export type AdminProductFormValues = z.input<typeof adminProductFormSchema>;

const usdToCents = (value: number) => Math.round(value * 100);

/** Converts validated form values (USD) into the API payload (cents). */
export function toAdminProductPayload(
  form: z.infer<typeof adminProductFormSchema>
): AdminProductInput {
  return {
    name: form.name,
    slug: form.slug,
    description: form.description,
    gender: form.gender,
    brandId: form.brandId,
    categoryId: form.categoryId,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    priceCents: usdToCents(form.priceUsd),
    compareAtPriceCents:
      form.compareAtPriceUsd !== undefined ? usdToCents(form.compareAtPriceUsd) : undefined,
    images: form.images,
    variants: form.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      priceCents: variant.priceUsd !== undefined ? usdToCents(variant.priceUsd) : undefined,
    })),
  };
}
