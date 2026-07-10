import { z } from "zod";

import { Gender } from "@/lib/generated/prisma/enums";

export const PRODUCT_SORT_VALUES = ["newest", "price-asc", "price-desc", "name-asc"] as const;
export type ProductSort = (typeof PRODUCT_SORT_VALUES)[number];

const pageSchema = z.coerce.number().int().min(1).default(1);
const perPageSchema = z.coerce.number().int().min(1).max(60).default(12);

/** Shared filter fields between /api/products (DB) and /api/search (Meilisearch). */
const catalogFilterFields = {
  category: z.string().trim().min(1).optional(),
  brand: z.string().trim().min(1).optional(),
  gender: z.enum(Gender).optional(),
  // Price bounds in integer cents, like every money value in the API.
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  // `true` filters; `false`/absent means "no filter", not "exclude".
  onSale: z.stringbool().optional(),
  featured: z.stringbool().optional(),
};

const priceRangeIsValid = (query: { minPrice?: number; maxPrice?: number }) =>
  query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice;

const PRICE_RANGE_ERROR = {
  message: "minPrice no puede ser mayor que maxPrice.",
  path: ["minPrice"] as ["minPrice"],
};

/** GET /api/products query params. */
export const productListQuerySchema = z
  .object({
    page: pageSchema,
    perPage: perPageSchema,
    sort: z.enum(PRODUCT_SORT_VALUES).default("newest"),
    ...catalogFilterFields,
  })
  .refine(priceRangeIsValid, PRICE_RANGE_ERROR);

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

export const SEARCH_SORT_VALUES = ["relevance", "price-asc", "price-desc", "newest"] as const;

/** GET /api/search query params. */
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
