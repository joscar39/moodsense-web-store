"use client";

import { HeartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Heart toggle on the PDP. The page is ISR-cached and user-agnostic, so the
 * wishlist state is fetched client-side; anonymous users are sent to /login.
 */
export function WishlistButton({ productId, slug }: { productId: string; slug: string }) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/account/wishlist")
      .then(async (response) => {
        if (!response.ok) return; // anonymous: leave state as unknown/false
        const body = (await response.json()) as { data: { productIds: string[] } };
        if (!cancelled) setInWishlist(body.data.productIds.includes(productId));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [productId]);

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
