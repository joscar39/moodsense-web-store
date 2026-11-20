import { ProductGridSkeleton } from "@/components/catalog/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto de carga que Next.js muestra mientras se prepara `/products`
 * (título + grilla de 12 tarjetas vacías).
 *
 * @example
 * // Automático al navegar a /products?category=gorras mientras el servidor responde.
 */
export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Skeleton className="mb-2 h-3 w-24" />
      <Skeleton className="mb-10 h-12 w-64" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
