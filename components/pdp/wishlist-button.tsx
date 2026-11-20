"use client";

import { HeartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Botón corazón de la ficha de producto para guardar o quitar de la wishlist.
 * La página es ISR (la misma para todos), así que el estado se consulta desde el
 * navegador; si el usuario no inició sesión, lo envía a /login.
 *
 * @example
 * <WishlistButton productId="clx123abc" slug="cloud-heavy-hoodie" />
 */
export function WishlistButton({ productId, slug }: { productId: string; slug: string }) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/wishlist")
      .then(async (response) => {
        if (!response.ok) return; // anónimo: el estado queda desconocido/false
        const body = (await response.json()) as { data: { productIds: string[] } };
        if (!cancelled) setInWishlist(body.data.productIds.includes(productId));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [productId]);

  // Agrega o quita según el estado actual; 401 → login con regreso a esta PDP.
  const toggle = async () => {
    const response = await fetch(
      inWishlist ? `/api/account/wishlist/${productId}` : "/api/account/wishlist",
      inWishlist
        ? { method: "DELETE" }
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          }
    );

    if (response.status === 401) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/products/${slug}`)}`);
      return;
    }
    if (!response.ok) {
      toast.error("No se pudo actualizar la wishlist.");
      return;
    }
    setInWishlist(!inWishlist);
    toast.success(inWishlist ? "Quitado de la wishlist." : "Guardado en tu wishlist.");
  };

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={inWishlist ? "Quitar de la wishlist" : "Guardar en la wishlist"}
      aria-pressed={inWishlist === true}
      className="rounded-none"
      onClick={toggle}
    >
      <HeartIcon className={`size-5 ${inWishlist ? "fill-current" : ""}`} />
    </Button>
  );
}
