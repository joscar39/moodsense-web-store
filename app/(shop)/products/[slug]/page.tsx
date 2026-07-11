import { notFound } from "next/navigation";
import { cache } from "react";

import { ProductGrid } from "@/components/catalog/product-grid";
import { SectionHeading } from "@/components/home/section-heading";
import { ProductGallery } from "@/components/pdp/product-gallery";
import { VariantSelector } from "@/components/pdp/variant-selector";
import { WishlistButton } from "@/components/pdp/wishlist-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ApiError } from "@/lib/api/handle-api-error";
import { getProductBySlug, listActiveProductSlugs, listProducts } from "@/lib/catalog/products";
import { productListQuerySchema } from "@/lib/validators/catalog";

import type { Metadata } from "next";

// ISR: detail pages are prerendered and revalidate every 5 minutes.
export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await listActiveProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

// cache() dedupes the query between generateMetadata and the page render.
const loadProduct = cache(async (slug: string) => {
  try {
    return await getProductBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  // notFound() must NOT be thrown from generateMetadata: it downgrades the
  // response to a soft 404 (200). The page component throws it instead.
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} · ${product.brand.name}`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const related = await listProducts(
    productListQuerySchema.parse({ category: product.category.slug, perPage: "5" })
  );
  const relatedItems = related.items
    .filter((item) => item.slug !== product.slug)
    .slice(0, 4)
    .map((item) => ({ ...item, brandName: item.brand.name }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {product.category.parent && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/products?category=${product.category.parent.slug}`}>
                  {product.category.parent.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbLink href={`/products?category=${product.category.slug}`}>
              {product.category.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map(({ url, alt }) => ({ url, alt }))}
          name={product.name}
        />

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
                {product.brand.name}
              </p>
              <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
                {product.name}
              </h1>
            </div>
            <WishlistButton productId={product.id} slug={product.slug} />
          </div>

          <VariantSelector
            product={{
              slug: product.slug,
              name: product.name,
              brandName: product.brand.name,
              imageUrl: product.images[0]?.url ?? null,
            }}
            variants={product.variants}
            basePriceCents={product.priceCents}
            compareAtPriceCents={product.compareAtPriceCents}
          />

          <div className="border-t pt-6">
            <h2 className="mb-2 text-xs tracking-[0.25em] uppercase">Descripción</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </div>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <section className="mt-20">
          <SectionHeading
            eyebrow="Completa el look"
            title="También te puede gustar"
            href={`/products?category=${product.category.slug}`}
            linkLabel={`Más ${product.category.name}`}
          />
          <ProductGrid products={relatedItems} />
        </section>
      )}
    </div>
  );
}
