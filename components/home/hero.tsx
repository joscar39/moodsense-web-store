import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Portada de la home con el slogan oficial y botones a todo el catálogo y a rebajas.
 *
 * @example
 * <Hero />
 */
export function Hero() {
  return (
    <section className="border-b">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-24 text-center sm:px-6 sm:py-32">
        <p className="text-xs tracking-[0.35em] text-muted-foreground uppercase">
          Curated multi-brand concept store · Head-to-toe style
        </p>
        <h1 className="max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight sm:text-7xl">
          Wear your vibe. <span className="italic">Make the match.</span>
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Streetwear premium, casual moderno y accesorios con carácter. Arma un outfit completo y
          auténtico en un solo lugar.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="rounded-none px-8 tracking-[0.2em] uppercase"
            render={<Link href="/products" />}
          >
            Comprar ahora
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-none border-foreground px-8 tracking-[0.2em] uppercase"
            render={<Link href="/products?onSale=true" />}
          >
            Ver rebajas
          </Button>
        </div>
      </div>
    </section>
  );
}
