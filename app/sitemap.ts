import { listActiveProductSlugs } from "@/lib/catalog/products";
import { listCategoryTree } from "@/lib/catalog/categories";

import type { MetadataRoute } from "next";

export const revalidate = 3600;

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl();
  const [slugs, categories] = await Promise.all([listActiveProductSlugs(), listCategoryTree()]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/search`, changeFrequency: "weekly", priority: 0.3 },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.flatMap((category) => [
    {
      url: `${base}/products?category=${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    ...category.children.map((child) => ({
      url: `${base}/products?category=${child.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ]);

  const productEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/products/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
