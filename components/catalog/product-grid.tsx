import { ProductCard } from "./product-card";

import type { ProductCardData } from "./product-card";

/**
 * Grilla responsive de `ProductCard`; si la lista está vacía muestra un mensaje de "sin resultados".
 *
 * @example
 * <ProductGrid products={[hoodie, gorra]} />
 */
export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-2xl">Nada por aquí… todavía.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Prueba con otros filtros o vuelve a la tienda completa.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
