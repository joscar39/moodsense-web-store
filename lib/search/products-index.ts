import { prisma } from "@/lib/db/prisma";

import { getMeiliClient } from "./client";

import type { Prisma } from "@/lib/generated/prisma/client";
import type { Gender } from "@/lib/generated/prisma/enums";

export const PRODUCTS_INDEX = "products";

const PRODUCTS_INDEX_SETTINGS = {
  searchableAttributes: ["name", "brandName", "categoryName", "description"],
  filterableAttributes: [
    "brandSlug",
    "categorySlug",
    "parentCategorySlug",
    "gender",
    "priceCents",
    "onSale",
    "inStock",
    "isFeatured",
  ],
  sortableAttributes: ["priceCents", "createdAtTimestamp"],
};

/** Documento desnormalizado que guarda Meilisearch por cada producto activo. */
export type ProductSearchDocument = {
  id: string;
  name: string;
  slug: string;
  description: string;
  gender: Gender;
  priceCents: number;
  compareAtPriceCents: number | null;
  onSale: boolean;
  isFeatured: boolean;
  inStock: boolean;
  brandName: string;
  brandSlug: string;
  categoryName: string;
  categorySlug: string;
  parentCategorySlug: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  createdAtTimestamp: number;
};

/** Relaciones que hacen falta para armar un documento del índice. */
const productIndexInclude = {
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true, parent: { select: { slug: true } } } },
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" }, take: 1 },
  variants: { select: { stock: true } },
} satisfies Prisma.ProductInclude;

type ProductForIndex = Prisma.ProductGetPayload<{ include: typeof productIndexInclude }>;

/**
 * Convierte un producto de la DB (con `productIndexInclude`) en el documento
 * plano que indexa Meilisearch.
 *
 * @example
 * const doc = buildProductDocument(product); // { id, name, brandSlug, inStock, ... }
 */
function buildProductDocument(product: ProductForIndex): ProductSearchDocument {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    gender: product.gender,
    priceCents: product.priceCents,
    compareAtPriceCents: product.compareAtPriceCents,
    onSale: product.compareAtPriceCents !== null,
    isFeatured: product.isFeatured,
    inStock: product.variants.some((variant) => variant.stock > 0),
    brandName: product.brand.name,
    brandSlug: product.brand.slug,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    parentCategorySlug: product.category.parent?.slug ?? null,
    imageUrl: product.images[0]?.url ?? null,
    imageAlt: product.images[0]?.alt ?? null,
    createdAtTimestamp: product.createdAt.getTime(),
  };
}

/**
 * Actualiza (o elimina, si se borró o está inactivo) el documento de un producto.
 * Lo llama el CRUD del admin: los fallos se loggean y nunca bloquean la escritura.
 *
 * @example
 * await syncProductDocument(product.id);
 */
export async function syncProductDocument(productId: string) {
  try {
    const index = getMeiliClient().index<ProductSearchDocument>(PRODUCTS_INDEX);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: productIndexInclude,
    });

    if (!product || !product.isActive) {
      await index.deleteDocuments([productId]).waitTask();
      return;
    }
    await index.addDocuments([buildProductDocument(product)]).waitTask();
  } catch (error) {
    console.error(`[search] failed to sync product ${productId}:`, error);
  }
}

/**
 * Reindexado completo: aplica los settings del índice, sube todos los productos
 * activos y elimina los inactivos. Idempotente; se ejecuta con `npm run search:sync`.
 *
 * @example
 * const { indexed, removed } = await syncProductsIndex(); // { indexed: 20, removed: 0 }
 */
export async function syncProductsIndex() {
  const client = getMeiliClient();
  const index = client.index<ProductSearchDocument>(PRODUCTS_INDEX);

  await client.createIndex(PRODUCTS_INDEX, { primaryKey: "id" }).waitTask();
  await index.updateSettings(PRODUCTS_INDEX_SETTINGS).waitTask();

  const products = await prisma.product.findMany({ include: productIndexInclude });

  const active = products.filter((product) => product.isActive);
  const inactiveIds = products.filter((product) => !product.isActive).map((product) => product.id);

  await index.addDocuments(active.map(buildProductDocument)).waitTask();
  if (inactiveIds.length > 0) {
    await index.deleteDocuments(inactiveIds).waitTask();
  }

  return { indexed: active.length, removed: inactiveIds.length };
}
