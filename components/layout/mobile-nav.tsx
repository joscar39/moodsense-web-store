"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import type { NavLink } from "./site-header";

/**
 * Menú hamburguesa para móvil: abre un panel lateral con los enlaces de navegación
 * y se cierra al elegir uno. Oculto en desktop.
 *
 * @example
 * <MobileNav links={[{ label: "Todo", href: "/products" }]} />
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú" />
        }
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl font-medium tracking-tight">
            Mood <span className="italic">Sense</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-2 flex flex-col gap-1 px-4" aria-label="Navegación principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm tracking-[0.2em] uppercase hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
