import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";
import { syncProductDocument } from "@/lib/search/products-index";

import type { AdminProductInput } from "@/lib/validators/admin";

/** Full listing for the admin table, inactive products included. */
export function listAdminProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      compareAtPriceCents: true,
      isActive: true,
      isFeatured: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
      variants: { select: { stock: true } },
    },
  });
}

/** Product with everything the edit form needs. 404 when missing. */
export async function getAdminProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
      variants: {
        orderBy: { createdAt: "asc" },
        select: { id: true, sku: true, size: true, color: true, priceCents: true, stock: true },
      },
    },
  });
  if (!product) throw new ApiError("NOT_FOUND", "Producto no encontrado.", 404);
  return product;
}

function productScalars(input: AdminProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description,
    gender: input.gender,
    priceCents: input.priceCents,
    compareAtPriceCents: input.compareAtPriceCents ?? null,
    brandId: input.brandId,
    categoryId: input.categoryId,
    isActive: input.isActive,
    isFeatured: input.isFeatured,
  };
}

export async function createProduct(input: AdminProductInput) {
  const product = await prisma.product.create({
    data: {
      ...productScalars(input),
      images: {
        create: input.images.map((image, position) => ({ ...image, position })),
      },
      variants: {
        create: input.variants.map((variant) => ({
          sku: variant.sku,
          size: variant.size ?? null,
          color: variant.color ?? null,
          priceCents: variant.priceCents ?? null,
          stock: variant.stock,
        })),
      },
    },
    select: { id: true, slug: true },
  });

  await syncProductDocument(product.id);
  return product;
}

/**
 * Updates a product reconciling variants by id: incoming ids are updated,
 * missing ids are deleted (order history survives via OrderItem snapshots +
 * SetNull), entries without id are created. Images are replaced wholesale.
 */
export async function updateProduct(id: string, input: AdminProductInput) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { slug: true, variants: { select: { id: true } } },
  });
  if (!existing) throw new ApiError("NOT_FOUND", "Producto no encontrado.", 404);

  const incomingIds = new Set(
    input.variants.map((variant) => variant.id).filter((vid): vid is string => Boolean(vid))
  );
  const toDelete = existing.variants
    .map((variant) => variant.id)
    .filter((vid) => !incomingIds.has(vid));

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: productScalars(input) });

    await tx.productImage.deleteMany({ where: { productId: id } });
    if (input.images.length > 0) {
      await tx.productImage.createMany({
        data: input.images.map((image, position) => ({ ...image, position, productId: id })),
      });
    }

    if (toDelete.length > 0) {
      await tx.productVariant.deleteMany({ where: { id: { in: toDelete }, productId: id } });
    }
    for (const variant of input.variants) {
      const data = {
        sku: variant.sku,
        size: variant.size ?? null,
        color: variant.color ?? null,
        priceCents: variant.priceCents ?? null,
        stock: variant.stock,
      };
      if (variant.id) {
        await tx.productVariant.update({ where: { id: variant.id, productId: id }, data });
      } else {
        await tx.productVariant.create({ data: { ...data, productId: id } });
      }
    }
  });

  await syncProductDocument(id);
  return { id, slug: input.slug, previousSlug: existing.slug };
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (!product) throw new ApiError("NOT_FOUND", "Producto no encontrado.", 404);

  await prisma.product.delete({ where: { id } });
  await syncProductDocument(id); // inactive/missing → removes the document
  return { slug: product.slug };
}
