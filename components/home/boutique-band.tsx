import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Banda premium en modo boutique (navy + dorado, variante "Dark/Lujo" de la marca)
 * con botón hacia la selección destacada.
 *
 * @example
 * <BoutiqueBand />
 */
export function BoutiqueBand() {
  return (
    <section className="dark bg-navy text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
        <p className="text-xs tracking-[0.35em] text-gold uppercase">Selección boutique</p>
        <h2 className="max-w-2xl font-serif text-4xl tracking-tight sm:text-5xl">
          Piezas destacadas, <span className="italic">curaduría</span> sin ruido.
        </h2>
        <p className="max-w-lg text-sm text-foreground/60">
          Lo mejor de cada marca en una sola selección: los esenciales que definen la temporada.
        </p>
        <Button
          size="lg"
          variant="outline"
          className="rounded-none border-gold px-8 tracking-[0.2em] text-gold uppercase hover:bg-gold hover:text-navy"
          render={<Link href="/products?featured=true" />}
        >
          Ver selección
        </Button>
      </div>
    </section>
  );
}
