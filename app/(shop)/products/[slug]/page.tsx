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
import { getProductBySlug, listActiveProductSlugs, listProducts } from "@/lib/catalog/products";
import { productListQuerySchema } from "@/lib/validators/catalog";

import type { Metadata } from "next";

// ISR: las PDP se prerenderizan y se revalidan cada 5 minutos.
export const revalidate = 300;

type Params = Promise<{ slug: string }>;

/**
 * Slugs a prerenderizar en build (SSG + ISR).
 *
 * @example
 * // [{ slug: "oversized-tee" }, ...]
 */
export async function generateStaticParams() {
  const slugs = await listActiveProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

// cache() evita repetir la consulta entre generateMetadata y el render; null = no existe.
const loadProduct = cache(getProductBySlug);

/**
 * Metadata SEO de la PDP (título, descripción, canonical y OpenGraph). Si el
 * producto no existe devuelve un título de fallback; nunca lanza notFound().
 *
 * @example
 * // /products/oversized-tee → { title: "Oversized Tee · Nocturne", ... }
 */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  // notFound() NO debe lanzarse desde generateMetadata: degrada la respuesta a
  // soft 404 (200). Lo lanza el componente de la página.
  if (!product) return { title: "Producto no encontrado" };
  const image = product.images[0];
  return {
    title: `${product.name} · ${product.brand.name}`,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} · ${product.brand.name}`,
      description: product.description.slice(0, 160),
      ...(image && { images: [{ url: image.url, alt: image.alt }] }),
    },
  };
}

/**
 * Página /products/[slug] (PDP): galería, selector de talla/color con stock,
 * wishlist, JSON-LD de schema.org y productos relacionados. 404 si no existe.
 *
 * @example
 * // GET /products/oversized-tee
 */
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

  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  // Datos estructurados schema.org/Product para rich results de Google.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.variants[0]?.sku,
    image: product.images.map((img) => img.url),
    brand: { "@type": "Brand", name: product.brand.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/products/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        // "<" escapado: un texto de producto con "</script>" no puede inyectar código.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
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
