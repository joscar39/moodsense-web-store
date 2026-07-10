import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";

import { buildProductOrderBy, buildProductWhere } from "./product-query";

import type { ProductListQuery } from "@/lib/validators/catalog";

const listItemSelect = {
  id: true,
  name: true,
  slug: true,
  gender: true,
  priceCents: true,
  compareAtPriceCents: true,
  isFeatured: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: {
    select: { url: true, alt: true },
    orderBy: { position: "asc" as const },
    take: 1,
  },
  // Just enough to derive inStock without loading every variant.
  variants: {
    where: { stock: { gt: 0 } },
    select: { id: true },
    take: 1,
  },
};

/**
 * Resolves a category slug to the ids to filter by: the category itself plus
 * its direct children (filtering by "ropa" must include "camisetas", etc.).
 * Returns an empty array when the slug does not exist, which matches nothing.
 */
async function resolveCategoryIds(slug: string): Promise<string[]> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, children: { select: { id: true } } },
  });
  if (!category) return [];
  return [category.id, ...category.children.map((child) => child.id)];
}

export async function listProducts(query: ProductListQuery) {
  const categoryIds = query.category ? await resolveCategoryIds(query.category) : undefined;
  const where = buildProductWhere(query, categoryIds);
  const orderBy = buildProductOrderBy(query.sort);

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      select: listItemSelect,
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
    }),
  ]);

  return {
    items: products.map(({ images, variants, ...product }) => ({
      ...product,
      image: images[0] ?? null,
      inStock: variants.length > 0,
    })),
    page: query.page,
    perPage: query.perPage,
    total,
    totalPages: Math.ceil(total / query.perPage),
  };
}

/** Active product slugs, for generateStaticParams (ISR). */
export async function listActiveProductSlugs() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((product) => product.slug);
}

/** Full product detail for the PDP. Throws NOT_FOUND (404) for unknown or inactive slugs. */
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          parent: { select: { name: true, slug: true } },
        },
      },
      images: { select: { url: true, alt: true, position: true }, orderBy: { position: "asc" } },
      variants: {
        select: { id: true, sku: true, size: true, color: true, priceCents: true, stock: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!product) {
    throw new ApiError("NOT_FOUND", "Producto no encontrado.", 404);
  }

  return product;
}
