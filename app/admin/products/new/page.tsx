import { ProductForm } from "@/components/admin/product-form";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { prisma } from "@/lib/db/prisma";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nuevo producto" };

/**
 * Página /admin/products/new: formulario vacío para crear un producto.
 *
 * @example
 * // GET /admin/products/new → ProductForm sin productId
 */
export default async function NewProductPage() {
  await requireAdminPage();
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl tracking-tight">Nuevo producto</h2>
      <ProductForm
        brands={brands}
        categories={categories}
        defaultValues={{
          name: "",
          slug: "",
          description: "",
          gender: "UNISEX",
          brandId: "",
          categoryId: "",
          isActive: true,
          isFeatured: false,
          priceUsd: "" as unknown as number,
          images: [],
          variants: [{ sku: "", size: "", color: "", stock: 0 }],
        }}
      />
    </div>
  );
}
