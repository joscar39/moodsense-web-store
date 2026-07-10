import type { Prisma } from "@/lib/generated/prisma/client";
import type { ProductListQuery, ProductSort } from "@/lib/validators/catalog";

/**
 * Builds the Prisma where clause for a validated product list query.
 * Only active products are ever exposed. `categoryIds` (the requested
 * category plus its children) is resolved by the caller; an empty array
 * means "category not found" and matches nothing.
 */
export function buildProductWhere(
  query: ProductListQuery,
  categoryIds?: string[]
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (categoryIds) where.categoryId = { in: categoryIds };
  if (query.brand) where.brand = { slug: query.brand };
  if (query.gender) where.gender = query.gender;

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.priceCents = {
      ...(query.minPrice !== undefined && { gte: query.minPrice }),
      ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
    };
  }

  if (query.onSale) where.compareAtPriceCents = { not: null };
  if (query.featured) where.isFeatured = true;

  return where;
}

export function buildProductOrderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ priceCents: "asc" }, { createdAt: "desc" }];
    case "price-desc":
      return [{ priceCents: "desc" }, { createdAt: "desc" }];
    case "name-asc":
      return [{ name: "asc" }];
    case "newest":
      return [{ createdAt: "desc" }];
  }
}
