"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Botón de papelera que borra un producto tras confirmar y refresca la tabla.
 *
 * @example
 * <DeleteProductButton id={product.id} name={product.name} />
 */
export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Eliminar ${name}`}
      disabled={busy}
      onClick={async () => {
        if (
          !window.confirm(
            `¿Eliminar "${name}" definitivamente? Los pedidos históricos se conservan.`
          )
        ) {
          return;
        }
        setBusy(true);
        const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        setBusy(false);
        if (!response.ok) {
          toast.error("No se pudo eliminar el producto.");
          return;
        }
        toast.success("Producto eliminado.");
        router.refresh();
      }}
    >
      <Trash2Icon className="size-4" />
    </Button>
  );
}
