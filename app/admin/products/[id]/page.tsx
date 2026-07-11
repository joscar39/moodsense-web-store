import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getAdminProduct } from "@/lib/admin/products";
import { ApiError } from "@/lib/api/handle-api-error";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { prisma } from "@/lib/db/prisma";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editar producto" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;

  let product;
  try {
    product = await getAdminProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl tracking-tight">Editar producto</h2>
      <ProductForm
        productId={product.id}
        brands={brands}
        categories={categories}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          gender: product.gender,
          brandId: product.brandId,
          categoryId: product.categoryId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          priceUsd: product.priceCents / 100,
          compareAtPriceUsd:
            product.compareAtPriceCents !== null ? product.compareAtPriceCents / 100 : undefined,
          images: product.images,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            size: variant.size ?? "",
            color: variant.color ?? "",
            priceUsd: variant.priceCents !== null ? variant.priceCents / 100 : undefined,
            stock: variant.stock,
          })),
        }}
      />
    </div>
  );
}
