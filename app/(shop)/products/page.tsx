import { Suspense } from "react";

import { FiltersPanel } from "@/components/catalog/filters-panel";
import { MobileFilters } from "@/components/catalog/mobile-filters";
import { PaginationNav } from "@/components/catalog/pagination-nav";
import { ProductGrid } from "@/components/catalog/product-grid";
import { ProductGridSkeleton } from "@/components/catalog/product-grid-skeleton";
import { SortSelect } from "@/components/catalog/sort-select";
import { firstSearchParamValues } from "@/lib/api/search-params";
import { listBrands } from "@/lib/catalog/brands";
import { listCategoryTree } from "@/lib/catalog/categories";
import { listProducts } from "@/lib/catalog/products";
import { productListQuerySchema } from "@/lib/validators/catalog";

import type { ProductListQuery } from "@/lib/validators/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Ropa, calzado, gorras y accesorios de streetwear premium y casual moderno. Filtra por categoría, marca, género y precio.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = firstSearchParamValues(await searchParams);
  const parsed = productListQuerySchema.safeParse(raw);
  // Invalid params fall back to the default listing instead of erroring.
  const query = parsed.success ? parsed.data : productListQuerySchema.parse({});

  const [categories, brands] = await Promise.all([listCategoryTree(), listBrands()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Mood Sense</p>
        <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Catálogo</h1>
      </header>

      <div className="mb-6 flex items-center justify-between gap-3">
        <MobileFilters categories={categories} brands={brands} />
        <div className="ml-auto">
          <SortSelect />
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <FiltersPanel categories={categories} brands={brands} />
        </aside>

        <Suspense key={JSON.stringify(query)} fallback={<ProductGridSkeleton />}>
          <ProductResults query={query} rawParams={raw} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductResults({
  query,
  rawParams,
}: {
  query: ProductListQuery;
  rawParams: Record<string, string>;
}) {
  const result = await listProducts(query);

  return (
    <div>
      <p className="mb-4 text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {result.total} {result.total === 1 ? "producto" : "productos"}
      </p>
      <ProductGrid
        products={result.items.map((item) => ({ ...item, brandName: item.brand.name }))}
      />
      <PaginationNav
        page={result.page}
        totalPages={result.totalPages}
        basePath="/products"
        searchParams={rawParams}
      />
    </div>
  );
}
