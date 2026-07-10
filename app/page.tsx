import { Button } from "@/components/ui/button";

/**
 * Temporary Phase 0 placeholder — replaced by the editorial Home in Phase 3.
 * Serves to verify fonts, brand tokens and shadcn/ui wiring end to end.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <p className="text-xs tracking-[0.35em] text-muted-foreground uppercase">
        Curated multi-brand concept store · Head-to-toe style
      </p>
      <h1 className="font-serif text-6xl tracking-tight sm:text-8xl">
        Mood <span className="italic">Sense</span>
      </h1>
      <p className="text-sm tracking-[0.25em] uppercase">Wear your vibe. Make the match.</p>
      <div className="flex gap-3">
        <Button size="lg">Shop soon</Button>
        <Button size="lg" variant="outline" className="border-gold text-foreground">
          Phase 0 · Environment ready
        </Button>
      </div>
      <footer className="fixed inset-x-0 bottom-0 bg-navy py-4 text-center text-xs tracking-[0.3em] text-gold uppercase">
        Mood Sense © 2026
      </footer>
    </main>
  );
}
