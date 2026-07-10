import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { listCategoryTree } from "@/lib/catalog/categories";

import type { NavLink } from "@/components/layout/site-header";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await listCategoryTree();

  const navLinks: NavLink[] = [
    ...categories.map((category) => ({
      label: category.name,
      href: `/products?category=${category.slug}`,
    })),
    { label: "Todo", href: "/products" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader navLinks={navLinks} />
      <main className="flex-1">{children}</main>
      <SiteFooter navLinks={navLinks} />
    </div>
  );
}
