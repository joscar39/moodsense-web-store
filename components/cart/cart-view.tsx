"use client";

import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cartSubtotalCents, MAX_QUANTITY_PER_LINE } from "@/lib/cart/cart-logic";
import { useCartStore } from "@/lib/cart/cart-store";
import { formatPrice } from "@/lib/format/price";

type CheckoutIssue = {
  variantId: string;
  code: string;
  message: string;
  availableStock?: number;
};

export function CartView() {
  const { items, setQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-3xl">Tu carrito está vacío.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Encuentra tu próximo match en la tienda.
        </p>
        <Button
          className="mt-8 rounded-none px-8 tracking-[0.2em] uppercase"
          render={<Link href="/products" />}
        >
          Ir a la tienda
        </Button>
      </div>
    );
  }

  const subtotal = cartSubtotalCents(items);

  const startCheckout = async () => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
        }),
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        const error = (body as { error?: { message?: string; details?: CheckoutIssue[] } }).error;
        for (const issue of error?.details ?? []) {
          toast.error(issue.message);
          // Sync the cart with real availability so the user can retry.
          if (issue.code === "INSUFFICIENT_STOCK") {
            setQuantity(issue.variantId, issue.availableStock ?? 0);
          }
          if (issue.code === "NOT_FOUND" || issue.code === "INACTIVE") {
            removeItem(issue.variantId);
          }
        }
        if (!error?.details?.length) {
          toast.error(error?.message ?? "No se pudo iniciar el pago.");
        }
        return;
      }

      const url = (body as { data: { url: string } }).data.url;
      window.location.assign(url);
    } catch {
      toast.error("No se pudo iniciar el pago. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y">
        {items.map((item) => {
          const variantLabel = [item.color, item.size].filter(Boolean).join(" · ");
          const maxSelectable = Math.min(Math.max(item.maxStock, 1), MAX_QUANTITY_PER_LINE);
          return (
            <li key={item.variantId} className="flex gap-4 py-6">
              <Link
                href={`/products/${item.productSlug}`}
                className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-secondary"
              >
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="flex flex-1 flex-col gap-1">
                <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
                  {item.brandName}
                </p>
                <Link href={`/products/${item.productSlug}`} className="text-sm font-medium">
                  {item.name}
                </Link>
                {variantLabel && <p className="text-xs text-muted-foreground">{variantLabel}</p>}
                <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-none"
                      aria-label="Restar uno"
                      onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                    >
                      <MinusIcon className="size-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-none"
                      aria-label="Sumar uno"
                      disabled={item.quantity >= maxSelectable}
                      onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                    >
                      <PlusIcon className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Quitar ${item.name} del carrito`}
                    onClick={() => removeItem(item.variantId)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm font-medium tabular-nums">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </p>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit border p-6">
        <h2 className="mb-4 text-xs tracking-[0.25em] uppercase">Resumen</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span>Gratis</span>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-base font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
        </div>
        <Button
          size="lg"
          className="mt-6 w-full rounded-none tracking-[0.2em] uppercase"
          disabled={submitting}
          onClick={startCheckout}
        >
          {submitting ? "Redirigiendo…" : "Finalizar compra"}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Pago seguro procesado por Stripe.
        </p>
      </aside>
    </div>
  );
}
