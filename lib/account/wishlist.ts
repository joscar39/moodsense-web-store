import { prisma } from "@/lib/db/prisma";

/**
 * Productos activos de la wishlist con los datos que pide la tarjeta de producto.
 *
 * @example
 * const items = await listWishlist(userId); // [{ productId, slug, name, inStock, ... }]
 */
export async function listWishlist(userId: string) {
  const entries = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      productId: true,
      product: {
        select: {
          slug: true,
          name: true,
          priceCents: true,
          compareAtPriceCents: true,
          isActive: true,
          brand: { select: { name: true } },
          images: { select: { url: true, alt: true }, orderBy: { position: "asc" }, take: 1 },
          variants: { where: { stock: { gt: 0 } }, select: { id: true }, take: 1 },
        },
      },
    },
  });

  return entries
    .filter((entry) => entry.product.isActive)
    .map(({ productId, product }) => ({
      productId,
      slug: product.slug,
      name: product.name,
      brandName: product.brand.name,
      priceCents: product.priceCents,
      compareAtPriceCents: product.compareAtPriceCents,
      image: product.images[0] ?? null,
      inStock: product.variants.length > 0,
    }));
}

/**
 * Solo los ids de producto: los usa el corazón de la PDP para saber su estado.
 *
 * @example
 * const ids = await listWishlistProductIds(userId); // ["prod1", "prod2"]
 */
export async function listWishlistProductIds(userId: string) {
  const entries = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return entries.map((entry) => entry.productId);
}

/**
 * Añade un producto a la wishlist; idempotente (repetirlo no hace nada).
 *
 * @example
 * await addToWishlist(userId, productId);
 */
export async function addToWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
}

/**
 * Quita un producto de la wishlist; idempotente.
 *
 * @example
 * await removeFromWishlist(userId, productId);
 */
export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
}
