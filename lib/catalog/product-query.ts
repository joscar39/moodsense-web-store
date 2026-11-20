import type { Prisma } from "@/lib/generated/prisma/client";
import type { ProductListQuery, ProductSort } from "@/lib/validators/catalog";

/**
 * Construye el `where` de Prisma para una consulta de listado ya validada.
 * Solo se exponen productos activos. `categoryIds` (la categoría pedida más sus
 * hijas) lo resuelve quien llama; un array vacío = categoría inexistente y no
 * coincide con nada.
 *
 * @example
 * buildProductWhere(query, ["idRopa", "idCamisetas"]);
 * // { isActive: true, categoryId: { in: ["idRopa", "idCamisetas"] } }
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

/**
 * Traduce el orden pedido a `orderBy` de Prisma (con desempate estable por fecha).
 *
 * @example
 * buildProductOrderBy("price-asc"); // [{ priceCents: "asc" }, { createdAt: "desc" }]
 */
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
