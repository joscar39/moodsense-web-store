"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Pantalla de error de la tienda: si una página de `(shop)` falla, muestra un mensaje
 * amable con botón "Reintentar" (vuelve a renderizar la sección) y registra el error en consola.
 *
 * @example
 * // Next.js la monta sola cuando falla, p. ej., /products:
 * // <ShopError error={error} reset={reintentar} />
 */
export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[shop] error boundary:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-32 text-center">
      <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Mood Sense</p>
      <h1 className="font-serif text-4xl tracking-tight">Algo salió mal</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Ocurrió un error inesperado al cargar esta página. Puedes intentarlo de nuevo.
      </p>
      <Button onClick={reset} className="rounded-none px-8 tracking-[0.2em] uppercase">
        Reintentar
      </Button>
    </div>
  );
}
