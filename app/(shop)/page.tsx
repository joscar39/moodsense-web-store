import { BoutiqueBand } from "@/components/home/boutique-band";
import { BrandStrip } from "@/components/home/brand-strip";
import { CategoryTiles } from "@/components/home/category-tiles";
import { Hero } from "@/components/home/hero";
import { SectionHeading } from "@/components/home/section-heading";
import { ProductGrid } from "@/components/catalog/product-grid";
import { listBrands } from "@/lib/catalog/brands";
import { listCategoryTree } from "@/lib/catalog/categories";
import { listProducts } from "@/lib/catalog/products";
import { productListQuerySchema } from "@/lib/validators/catalog";

// ISR: the home is fully static and revalidates every 5 minutes.
export const revalidate = 300;

export default async function HomePage() {
  const [featured, newest, categories, brands] = await Promise.all([
    listProducts(productListQuerySchema.parse({ featured: "true", perPage: "4" })),
    listProducts(productListQuerySchema.parse({ sort: "newest", perPage: "8" })),
    listCategoryTree(),
    listBrands(),
  ]);

  return (
    <>
      <Hero />
      <BrandStrip brands={brands} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="La selección"
          title="Destacados de la temporada"
          href="/products?featured=true"
          linkLabel="Ver todo"
        />
        <ProductGrid
          products={featured.items.map((item) => ({ ...item, brandName: item.brand.name }))}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <SectionHeading eyebrow="Head to toe" title="Compra por categoría" />
        <CategoryTiles categories={categories} />
      </section>

      <BoutiqueBand />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Recién llegados"
          title="Lo último en la tienda"
          href="/products"
          linkLabel="Ver catálogo"
        />
        <ProductGrid
          products={newest.items.map((item) => ({ ...item, brandName: item.brand.name }))}
        />
      </section>
    </>
  );
}
