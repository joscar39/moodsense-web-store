"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/orders", label: "Pedidos" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Panel admin" className="flex flex-row flex-wrap gap-1 lg:flex-col">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground lg:mt-4"
      >
        ← Tienda
      </Link>
    </nav>
  );
}
