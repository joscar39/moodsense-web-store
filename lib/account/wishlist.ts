import { prisma } from "@/lib/db/prisma";

/** Wishlist entries with the data the product card needs. */
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

/** Product ids only — used by client toggles to know the current state. */
export async function listWishlistProductIds(userId: string) {
  const entries = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return entries.map((entry) => entry.productId);
}

/** Idempotent add (re-adding an existing entry is a no-op). */
export async function addToWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},
    create: { userId, productId },
  });
}

/** Idempotent remove. */
export async function removeFromWishlist(userId: string, productId: string) {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId } });
}
