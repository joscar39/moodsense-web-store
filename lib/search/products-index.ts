import { prisma } from "@/lib/db/prisma";

import { getMeiliClient } from "./client";

import type { Prisma } from "@/lib/generated/prisma/client";
import type { Gender } from "@/lib/generated/prisma/enums";

export const PRODUCTS_INDEX = "products";

export const PRODUCTS_INDEX_SETTINGS = {
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

type ProductForIndex = Prisma.ProductGetPayload<{
  include: {
    brand: { select: { name: true; slug: true } };
    category: { select: { name: true; slug: true; parent: { select: { slug: true } } } };
    images: { select: { url: true; alt: true }; orderBy: { position: "asc" }; take: 1 };
    variants: { select: { stock: true } };
  };
}>;

export function buildProductDocument(product: ProductForIndex): ProductSearchDocument {
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
 * Full reindex: applies index settings, upserts every active product and
 * removes inactive/deleted ones. Idempotent — safe to run repeatedly.
 * Manual for now (`npm run search:sync`); will be triggered by admin CRUD in Phase 6.
 */
export async function syncProductsIndex() {
  const client = getMeiliClient();
  const index = client.index<ProductSearchDocument>(PRODUCTS_INDEX);

  await client.createIndex(PRODUCTS_INDEX, { primaryKey: "id" }).waitTask();
  await index.updateSettings(PRODUCTS_INDEX_SETTINGS).waitTask();

  const products = await prisma.product.findMany({
    include: {
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true, parent: { select: { slug: true } } } },
      images: { select: { url: true, alt: true }, orderBy: { position: "asc" as const }, take: 1 },
      variants: { select: { stock: true } },
    },
  });

  const active = products.filter((product) => product.isActive);
  const inactiveIds = products.filter((product) => !product.isActive).map((product) => product.id);

  await index.addDocuments(active.map(buildProductDocument)).waitTask();
  if (inactiveIds.length > 0) {
    await index.deleteDocuments(inactiveIds).waitTask();
  }

  return { indexed: active.length, removed: inactiveIds.length };
}
