"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { applyCartIssues } from "@/lib/cart/apply-cart-issues";
import { cartSubtotalCents } from "@/lib/cart/cart-logic";
import { useCartStore } from "@/lib/cart/cart-store";
import { formatPrice } from "@/lib/format/price";
import { variantLabel } from "@/lib/format/variant-label";
import { manualCheckoutFormSchema } from "@/lib/validators/checkout";

import type { ManualCheckoutFormValues } from "@/lib/validators/checkout";

/**
 * Formulario de checkout manual (WhatsApp): pide contacto y envío, muestra el
 * resumen del carrito y crea el pedido en POST /api/checkout/manual. Si el
 * servidor rechaza el carrito (400/409), lo corrige y avisa al usuario.
 *
 * @example
 * <ManualCheckoutForm />
 */
export function ManualCheckoutForm() {
  const router = useRouter();
  const { items, setQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ManualCheckoutFormValues>({
    resolver: zodResolver(manualCheckoutFormSchema),
    defaultValues: {
      customer: { name: "", phone: "", email: "" },
      shipping: { line1: "", city: "", country: "DO" },
    },
  });

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-serif text-3xl">Tu carrito está vacío.</p>
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

  const onSubmit = handleSubmit(async (values) => {
    const response = await fetch("/api/checkout/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        items: items.map(({ variantId, quantity }) => ({ variantId, quantity })),
      }),
    });
    if (!response.ok) {
      const messages = await applyCartIssues(
        response,
        { setQuantity, removeItem },
        "No se pudo crear el pedido."
      );
      messages.forEach((message) => toast.error(message));
      return;
    }

    const body: unknown = await response.json().catch(() => null);
    const orderId = (body as { data?: { orderId?: string } } | null)?.data?.orderId;
    if (!orderId) {
      toast.error("No se pudo crear el pedido.");
      return;
    }
    router.push(`/checkout/confirmation/${orderId}`);
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <form onSubmit={onSubmit} className="space-y-8" noValidate id="manual-checkout">
        <section>
          <h2 className="mb-4 text-xs tracking-[0.25em] uppercase">Contacto</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="c-name">Nombre completo</Label>
              <Input
                id="c-name"
                autoComplete="name"
                className="mt-1.5"
                {...register("customer.name")}
              />
              <FieldError message={errors.customer?.name?.message} />
            </div>
            <div>
              <Label htmlFor="c-phone">WhatsApp / Teléfono</Label>
              <Input
                id="c-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 809 555 0100"
                className="mt-1.5"
                {...register("customer.phone")}
              />
              <FieldError message={errors.customer?.phone?.message} />
            </div>
            <div>
              <Label htmlFor="c-email">Email (opcional)</Label>
              <Input
                id="c-email"
                type="email"
                autoComplete="email"
                className="mt-1.5"
                {...register("customer.email")}
              />
              <FieldError message={errors.customer?.email?.message} />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xs tracking-[0.25em] uppercase">Dirección de envío</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="s-line1">Dirección</Label>
              <Input
                id="s-line1"
                autoComplete="address-line1"
                className="mt-1.5"
                {...register("shipping.line1")}
              />
              <FieldError message={errors.shipping?.line1?.message} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="s-line2">Referencia / línea 2 (opcional)</Label>
              <Input
                id="s-line2"
                autoComplete="address-line2"
                className="mt-1.5"
                {...register("shipping.line2")}
              />
            </div>
            <div>
              <Label htmlFor="s-city">Ciudad</Label>
              <Input
                id="s-city"
                autoComplete="address-level2"
                className="mt-1.5"
                {...register("shipping.city")}
              />
              <FieldError message={errors.shipping?.city?.message} />
            </div>
            <div>
              <Label htmlFor="s-state">Provincia (opcional)</Label>
              <Input
                id="s-state"
                autoComplete="address-level1"
                className="mt-1.5"
                {...register("shipping.state")}
              />
            </div>
            <div>
              <Label htmlFor="s-postal">Código postal (opcional)</Label>
              <Input
                id="s-postal"
                autoComplete="postal-code"
                className="mt-1.5"
                {...register("shipping.postalCode")}
              />
            </div>
            <div>
              <Label htmlFor="s-country">País (2 letras)</Label>
              <Input
                id="s-country"
                maxLength={2}
                className="mt-1.5"
                {...register("shipping.country")}
              />
              <FieldError message={errors.shipping?.country?.message} />
            </div>
          </div>
        </section>
      </form>

      <aside className="h-fit border p-6">
        <h2 className="mb-4 text-xs tracking-[0.25em] uppercase">Tu pedido</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => {
            const label = variantLabel(item.color, item.size);
            return (
              <li key={item.variantId} className="flex justify-between gap-3">
                <span>
                  {item.quantity} × {item.name}
                  {label && <span className="text-muted-foreground"> ({label})</span>}
                </span>
                <span className="tabular-nums">
                  {formatPrice(item.unitPriceCents * item.quantity)}
                </span>
              </li>
            );
          })}
        </ul>
        <Separator className="my-4" />
        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        <Button
          type="submit"
          form="manual-checkout"
          size="lg"
          className="mt-6 w-full rounded-none tracking-[0.2em] uppercase"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creando pedido…" : "Realizar pedido"}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Al confirmar, apartamos tu pedido y te contactamos por WhatsApp para coordinar el pago
          (transferencia o efectivo contra entrega).
        </p>
      </aside>
    </div>
  );
}
