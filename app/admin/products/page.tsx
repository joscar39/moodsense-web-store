import Link from "next/link";

import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAdminProducts } from "@/lib/admin/products";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { formatPrice } from "@/lib/format/price";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Productos" };

export default async function AdminProductsPage() {
  await requireAdminPage();
  const products = await listAdminProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl tracking-tight">
          Productos <span className="text-base text-muted-foreground">({products.length})</span>
        </h2>
        <Button
          className="rounded-none tracking-[0.15em] uppercase"
          render={<Link href="/admin/products/new" />}
        >
          Nuevo producto
        </Button>
      </div>

      <div className="overflow-x-auto border-y">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs tracking-[0.15em] text-muted-foreground uppercase">
              <th className="px-2 py-3 font-normal">Producto</th>
              <th className="px-2 py-3 font-normal">Marca</th>
              <th className="px-2 py-3 font-normal">Categoría</th>
              <th className="px-2 py-3 text-right font-normal">Precio</th>
              <th className="px-2 py-3 text-right font-normal">Stock</th>
              <th className="px-2 py-3 font-normal">Estado</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => {
              const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
              return (
                <tr key={product.id} className="hover:bg-accent/40">
                  <td className="px-2 py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{product.slug}</p>
                  </td>
                  <td className="px-2 py-3">{product.brand.name}</td>
                  <td className="px-2 py-3">{product.category.name}</td>
                  <td className="px-2 py-3 text-right tabular-nums">
                    {formatPrice(product.priceCents)}
                    {product.compareAtPriceCents && (
                      <span className="block text-xs text-muted-foreground line-through">
                        {formatPrice(product.compareAtPriceCents)}
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-2 py-3 text-right tabular-nums ${stock === 0 ? "font-medium text-destructive" : ""}`}
                  >
                    {stock}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex gap-1.5">
                      {!product.isActive && (
                        <Badge variant="secondary" className="rounded-none text-[10px] uppercase">
                          Inactivo
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge className="rounded-none bg-navy text-[10px] text-gold uppercase">
                          Destacado
                        </Badge>
                      )}
                      {product.isActive && !product.isFeatured && (
                        <Badge variant="secondary" className="rounded-none text-[10px] uppercase">
                          Activo
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <DeleteProductButton id={product.id} name={product.name} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
