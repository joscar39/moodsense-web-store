import { z } from "zod";

import { Gender } from "@/lib/generated/prisma/enums";

const PRODUCT_SORT_VALUES = ["newest", "price-asc", "price-desc", "name-asc"] as const;
export type ProductSort = (typeof PRODUCT_SORT_VALUES)[number];

const pageSchema = z.coerce.number().int().min(1).default(1);
const perPageSchema = z.coerce.number().int().min(1).max(60).default(12);

/** Filtros compartidos entre /api/products (DB) y /api/search (Meilisearch). */
const catalogFilterFields = {
  category: z.string().trim().min(1).optional(),
  brand: z.string().trim().min(1).optional(),
  gender: z.enum(Gender).optional(),
  // Límites de precio en centavos enteros, como todo valor de dinero en la API.
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  // `true` filtra; `false`/ausente significa "sin filtro", no "excluir".
  onSale: z.stringbool().optional(),
  featured: z.stringbool().optional(),
};

/** `minPrice` no puede superar a `maxPrice` cuando vienen ambos. */
const priceRangeIsValid = (query: { minPrice?: number; maxPrice?: number }) =>
  query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice;

const PRICE_RANGE_ERROR = {
  message: "minPrice no puede ser mayor que maxPrice.",
  path: ["minPrice"] as ["minPrice"],
};

/**
 * Query params de GET /api/products y del PLP (paginación, orden y filtros).
 *
 * @example
 * productListQuerySchema.parse({ category: "ropa", minPrice: "1000" });
 */
export const productListQuerySchema = z
  .object({
    page: pageSchema,
    perPage: perPageSchema,
    sort: z.enum(PRODUCT_SORT_VALUES).default("newest"),
    ...catalogFilterFields,
  })
  .refine(priceRangeIsValid, PRICE_RANGE_ERROR);

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

const SEARCH_SORT_VALUES = ["relevance", "price-asc", "price-desc", "newest"] as const;

/**
 * Query params de GET /api/search y de /search (`q` obligatorio + filtros del PLP).
 *
 * @example
 * searchQuerySchema.parse({ q: "hoodie", sort: "price-asc" });
 */
export const searchQuerySchema = z
  .object({
    q: z
      .string({ error: "El parámetro q es obligatorio." })
      .trim()
      .min(1, "El parámetro q es obligatorio.")
      .max(200, "La búsqueda no puede superar 200 caracteres."),
    page: pageSchema,
    perPage: perPageSchema,
    sort: z.enum(SEARCH_SORT_VALUES).default("relevance"),
    ...catalogFilterFields,
  })
  .refine(priceRangeIsValid, PRICE_RANGE_ERROR);

export type SearchQuery = z.infer<typeof searchQuerySchema>;
