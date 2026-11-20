import Link from "next/link";

import type { NavLink } from "./site-header";

/**
 * Pie de página boutique (navy + dorado) con marca, slogan, enlaces de categorías y ayuda.
 *
 * @example
 * <SiteFooter navLinks={[{ label: "Gorras", href: "/products?category=gorras" }]} />
 */
export function SiteFooter({ navLinks }: { navLinks: NavLink[] }) {
  return (
    <footer className="dark mt-20 bg-navy text-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="font-serif text-3xl font-medium tracking-tight">
            Mood <span className="italic">Sense</span>
          </p>
          <p className="text-xs tracking-[0.3em] text-gold uppercase">
            Wear your vibe. Make the match.
          </p>
          <p className="max-w-xs text-sm text-foreground/60">
            Curated multi-brand concept store · Head-to-toe style. Streetwear premium y casual
            moderno en un solo lugar.
          </p>
        </div>

        <nav className="space-y-3" aria-label="Categorías">
          <p className="text-xs tracking-[0.3em] text-gold uppercase">Tienda</p>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <p className="text-xs tracking-[0.3em] text-gold uppercase">Ayuda</p>
          <ul className="space-y-2 text-sm text-foreground/70">
            <li>Envíos y devoluciones</li>
            <li>Guía de tallas</li>
            <li>Contacto</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-foreground/10 py-5 text-center text-xs tracking-[0.3em] uppercase">
        <span className="text-foreground/50">Mood Sense © {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
