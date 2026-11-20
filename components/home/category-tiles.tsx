import Link from "next/link";

/** Datos mínimos de una categoría raíz para pintar su tile. */
type CategoryTile = {
  slug: string;
  name: string;
  description: string | null;
  productCount: number;
  children: { productCount: number }[];
};

/**
 * Grilla de tiles de categorías raíz con el total de piezas (propias + subcategorías);
 * cada tile lleva al catálogo filtrado por esa categoría.
 *
 * @example
 * <CategoryTiles
 *   categories={[{ slug: "camisetas", name: "Camisetas", description: null, productCount: 3, children: [] }]}
 * />
 */
export function CategoryTiles({ categories }: { categories: CategoryTile[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => {
        const total =
          category.productCount +
          category.children.reduce((sum, child) => sum + child.productCount, 0);
        return (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            className="group flex aspect-[4/3] flex-col justify-between border border-foreground/15 p-6 transition-colors hover:bg-foreground hover:text-background"
          >
            <p className="text-xs tracking-[0.25em] uppercase opacity-60">
              {total} {total === 1 ? "pieza" : "piezas"}
            </p>
            <div>
              <h3 className="font-serif text-2xl tracking-tight sm:text-3xl">{category.name}</h3>
              <p className="mt-1 text-xs tracking-[0.2em] uppercase opacity-60 transition-opacity group-hover:opacity-90">
                Explorar →
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
