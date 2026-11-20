import Link from "next/link";

/**
 * Franja con los nombres de las marcas; cada uno lleva al catálogo filtrado por esa marca.
 *
 * @example
 * <BrandStrip brands={[{ slug: "atlas-supply", name: "Atlas Supply" }]} />
 */
export function BrandStrip({ brands }: { brands: { slug: string; name: string }[] }) {
  return (
    <section className="border-y">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-8 sm:px-6">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/products?brand=${brand.slug}`}
            className="text-sm tracking-[0.3em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
