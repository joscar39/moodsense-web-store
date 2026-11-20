"use client";

import { XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Botón (X) sobre la tarjeta que quita el producto de la wishlist y refresca la página.
 *
 * @example
 * <RemoveFromWishlistButton productId={item.productId} productName={item.name} />
 */
export function RemoveFromWishlistButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      size="icon"
      className="absolute top-2 right-2 z-10 size-8 rounded-full opacity-90"
      aria-label={`Quitar ${productName} de la wishlist`}
      onClick={async () => {
        const response = await fetch(`/api/account/wishlist/${productId}`, { method: "DELETE" });
        if (!response.ok) {
          toast.error("No se pudo quitar de la wishlist.");
          return;
        }
        router.refresh();
      }}
    >
      <XIcon className="size-4" />
    </Button>
  );
}
