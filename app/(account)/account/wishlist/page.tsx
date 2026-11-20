import Link from "next/link";

import { RemoveFromWishlistButton } from "@/components/account/remove-from-wishlist-button";
import { ProductCard } from "@/components/catalog/product-card";
import { listWishlist } from "@/lib/account/wishlist";
import { auth } from "@/lib/auth";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mi wishlist" };

/**
 * Página /account/wishlist: grid de productos guardados con botón para quitarlos.
 *
 * @example
 * // GET /account/wishlist → tarjetas de producto de la wishlist
 */
export default async function WishlistPage() {
  const session = await auth();
  const items = await listWishlist(session!.user.id);

  if (items.length === 0) {
    return (
      <div>
        <h2 className="mb-2 font-serif text-2xl tracking-tight">Wishlist</h2>
        <p className="text-sm text-muted-foreground">
          Tu wishlist está vacía. Marca el corazón en cualquier producto para guardarlo aquí.{" "}
          <Link href="/products" className="text-foreground underline underline-offset-4">
            Explorar la tienda
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl tracking-tight">Wishlist</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.productId} className="relative">
            <RemoveFromWishlistButton productId={item.productId} productName={item.name} />
            <ProductCard product={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
