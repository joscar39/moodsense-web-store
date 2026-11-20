import { UserIcon } from "lucide-react";
import Link from "next/link";

import { CartButton } from "@/components/cart/cart-button";
import { Button } from "@/components/ui/button";

import { MobileNav } from "./mobile-nav";
import { SearchForm } from "./search-form";

/** Enlace de navegación (texto visible + destino); lo comparten header, footer y menú móvil. */
export type NavLink = { label: string; href: string };

/**
 * Header fijo de la tienda: logo, navegación por categorías, buscador, acceso a la
 * cuenta y carrito. En móvil el menú pasa a `MobileNav` y el buscador baja a una segunda fila.
 *
 * @example
 * <SiteHeader navLinks={[{ label: "Calzado", href: "/products?category=calzado" }]} />
 */
export function SiteHeader({ navLinks }: { navLinks: NavLink[] }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <MobileNav links={navLinks} />

        <Link
          href="/"
          className="font-serif text-2xl font-medium tracking-tight"
          aria-label="Mood Sense — inicio"
        >
          Mood <span className="italic">Sense</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs tracking-[0.2em] text-foreground/70 uppercase transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <SearchForm />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mi cuenta"
            render={<Link href="/account" />}
          >
            <UserIcon className="size-5" />
          </Button>
          <CartButton />
        </div>
      </div>
      <div className="border-t px-4 py-2 sm:hidden">
        <SearchForm />
      </div>
    </header>
  );
}
