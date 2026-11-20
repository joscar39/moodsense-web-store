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
  // Lo justo para derivar inStock sin cargar todas las variantes.
  variants: {
    where: { stock: { gt: 0 } },
    select: { id: true },
    take: 1,
  },
};

/**
 * Resuelve el slug de una categoría a los ids por los que filtrar: la propia
 * categoría más sus hijas directas (filtrar por "ropa" incluye "camisetas").
 * Devuelve un array vacío si el slug no existe, lo que no coincide con nada.
 *
 * @example
 * await resolveCategoryIds("ropa"); // ["idRopa", "idCamisetas", ...]
 */
async function resolveCategoryIds(slug: string): Promise<string[]> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true, children: { select: { id: true } } },
  });
  if (!category) return [];
  return [category.id, ...category.children.map((child) => child.id)];
}

/**
 * Listado paginado de productos activos para el PLP y GET /api/products,
 * con filtros y orden ya validados por `productListQuerySchema`.
 *
 * @example
 * const { items, total, totalPages } = await listProducts(
 *   productListQuerySchema.parse({ category: "ropa", sort: "price-asc" })
 * );
 */
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

/**
 * Slugs de los productos activos, para `generateStaticParams` de la PDP (ISR).
 *
 * @example
 * const slugs = await listActiveProductSlugs(); // ["oversized-tee", ...]
 */
export async function listActiveProductSlugs() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((product) => product.slug);
}

/**
 * Detalle completo de un producto activo para la PDP (marca, categoría con
 * padre, imágenes y variantes). `null` si el slug no existe o está inactivo.
 *
 * @example
 * const product = await getProductBySlug("oversized-tee");
 * if (!product) notFound();
 */
export function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
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
}
