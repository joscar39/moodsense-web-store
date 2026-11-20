import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api/handle-api-error";
import { prisma } from "@/lib/db/prisma";
import { syncProductDocument } from "@/lib/search/products-index";

import type { AdminProductInput } from "@/lib/validators/admin";

/**
 * Listado completo para la tabla del admin, incluidos los productos inactivos.
 *
 * @example
 * const products = await listAdminProducts();
 */
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

/**
 * Producto con todo lo que necesita el formulario de edición. `null` si no existe.
 *
 * @example
 * const product = await getAdminProduct(id);
 * if (!product) notFound();
 */
export function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
      variants: {
        orderBy: { createdAt: "asc" },
        select: { id: true, sku: true, size: true, color: true, priceCents: true, stock: true },
      },
    },
  });
}

/**
 * Revalida el ISR del catálogo tras una mutación del admin: home, PLP y las
 * PDPs de los slugs indicados (los `undefined` se ignoran).
 *
 * @example
 * revalidateCatalog([result.slug, result.previousSlug]);
 */
export function revalidateCatalog(slugs: (string | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/products");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/products/${slug}`);
  }
}

/**
 * Campos escalares del producto tal como se guardan en la DB.
 *
 * @example
 * await prisma.product.update({ where: { id }, data: productScalars(input) });
 */
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

/**
 * Datos de una variante para create/update (opcionales ausentes → null en la DB).
 *
 * @example
 * variantData({ sku: "MS-001-M", size: "M", stock: 3 });
 * // { sku: "MS-001-M", size: "M", color: null, priceCents: null, stock: 3 }
 */
function variantData(variant: AdminProductInput["variants"][number]) {
  return {
    sku: variant.sku,
    size: variant.size ?? null,
    color: variant.color ?? null,
    priceCents: variant.priceCents ?? null,
    stock: variant.stock,
  };
}

/**
 * Crea un producto con sus imágenes y variantes y lo sincroniza con Meilisearch.
 *
 * @example
 * const { id, slug } = await createProduct(adminProductSchema.parse(body));
 */
export async function createProduct(input: AdminProductInput) {
  const product = await prisma.product.create({
    data: {
      ...productScalars(input),
      images: {
        create: input.images.map((image, position) => ({ ...image, position })),
      },
      variants: { create: input.variants.map(variantData) },
    },
    select: { id: true, slug: true },
  });

  await syncProductDocument(product.id);
  return product;
}

/**
 * Actualiza un producto (404 si no existe) reconciliando variantes por id: los
 * ids recibidos se actualizan, los ausentes se borran (el historial sobrevive
 * gracias al snapshot de OrderItem + SetNull) y las entradas sin id se crean.
 * Las imágenes se reemplazan completas.
 *
 * @example
 * const { slug, previousSlug } = await updateProduct(id, input);
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
      const data = variantData(variant);
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

/**
 * Borra un producto (404 si no existe) y quita su documento del índice de búsqueda.
 *
 * @example
 * const { slug } = await deleteProduct(id);
 */
export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (!product) throw new ApiError("NOT_FOUND", "Producto no encontrado.", 404);

  await prisma.product.delete({ where: { id } });
  await syncProductDocument(id); // inexistente → elimina el documento
  return { slug: product.slug };
}
