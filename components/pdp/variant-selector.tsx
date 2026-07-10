"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format/price";

export type PdpVariant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  priceCents: number | null;
  stock: number;
};

const LOW_STOCK_THRESHOLD = 5;

/**
 * Size/color picker. Variant price overrides the product base price.
 * Add-to-cart is a placeholder until the Phase 4 cart lands.
 */
export function VariantSelector({
  variants,
  basePriceCents,
  compareAtPriceCents,
}: {
  variants: PdpVariant[];
  basePriceCents: number;
  compareAtPriceCents: number | null;
}) {
  const colors = [...new Set(variants.map((v) => v.color).filter((c): c is string => c !== null))];
  const [color, setColor] = useState<string | null>(colors[0] ?? null);

  const sizesForColor = variants.filter((v) => color === null || v.color === color);
  const hasSizes = sizesForColor.some((v) => v.size !== null);
  const [variantId, setVariantId] = useState<string | null>(
    hasSizes ? null : (sizesForColor[0]?.id ?? null)
  );

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const priceCents = selected?.priceCents ?? basePriceCents;
  const onSale = compareAtPriceCents !== null;

  return (
    <div className="space-y-6">
      <p className="text-2xl">
        <span className={onSale ? "font-medium text-destructive" : undefined}>
          {formatPrice(priceCents)}
        </span>
        {onSale && (
          <span className="ml-3 text-lg text-muted-foreground line-through">
            {formatPrice(compareAtPriceCents)}
          </span>
        )}
      </p>

      {colors.length > 1 && (
        <div>
          <p className="mb-2 text-xs tracking-[0.25em] uppercase">
            Color{color ? `: ${color}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={option === color ? "default" : "outline"}
                className="rounded-none"
                onClick={() => {
                  setColor(option);
                  setVariantId(null);
                }}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}

      {hasSizes && (
        <div>
          <p className="mb-2 text-xs tracking-[0.25em] uppercase">Talla</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Talla">
            {sizesForColor.map((variant) => {
              const soldOut = variant.stock === 0;
              const active = variant.id === variantId;
              return (
                <Button
                  key={variant.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  size="sm"
                  variant={active ? "default" : "outline"}
                  disabled={soldOut}
                  className={`min-w-11 rounded-none ${soldOut ? "line-through" : ""}`}
                  onClick={() => setVariantId(variant.id)}
                >
                  {variant.size}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="font-mono text-xs">{selected.sku}</p>
          {selected.stock === 0 ? (
            <p>Agotado</p>
          ) : selected.stock <= LOW_STOCK_THRESHOLD ? (
            <p className="text-destructive">
              ¡Solo {selected.stock} {selected.stock === 1 ? "unidad" : "unidades"}!
            </p>
          ) : (
            <p>En stock</p>
          )}
        </div>
      )}

      <Button
        size="lg"
        className="w-full rounded-none tracking-[0.2em] uppercase sm:w-auto sm:px-12"
        disabled={!selected || selected.stock === 0}
        onClick={() =>
          toast("Muy pronto", {
            description: "El carrito estará disponible en breve. ¡Gracias por la paciencia!",
          })
        }
      >
        {selected ? "Añadir al carrito" : hasSizes ? "Elige tu talla" : "Añadir al carrito"}
      </Button>
    </div>
  );
}
