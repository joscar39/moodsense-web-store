"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "./sign-out-button";

const LINKS = [
  { href: "/account", label: "Perfil" },
  { href: "/account/orders", label: "Pedidos" },
  { href: "/account/addresses", label: "Direcciones" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Mi cuenta" className="flex flex-row flex-wrap gap-1 lg:flex-col">
      {LINKS.map((link) => {
        const active =
          link.href === "/account" ? pathname === "/account" : pathname.startsWith(link.href);
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
      <div className="lg:mt-4">
        <SignOutButton />
      </div>
    </nav>
  );
}
