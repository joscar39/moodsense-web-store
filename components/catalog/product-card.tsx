import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { discountPercent, formatPrice } from "@/lib/format/price";

/** Datos que necesita una tarjeta de producto (precios en centavos). */
export type ProductCardData = {
  slug: string;
  name: string;
  brandName: string;
  priceCents: number;
  compareAtPriceCents: number | null;
  image: { url: string; alt: string } | null;
  inStock: boolean;
};

/**
 * Tarjeta de producto para grillas: imagen, marca, nombre, precio y badges de
 * descuento o agotado. Al hacer clic lleva a la ficha del producto.
 *
 * @example
 * <ProductCard
 *   product={{ slug: "cloud-heavy-hoodie", name: "Cloud Heavy Hoodie", brandName: "Atlas Supply",
 *     priceCents: 8900, compareAtPriceCents: null, image: null, inStock: true }}
 * />
 */
export function ProductCard({ product }: { product: ProductCardData }) {
  const onSale = product.compareAtPriceCents !== null;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Sin imagen
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {onSale && (
            <Badge className="rounded-none bg-navy text-[10px] tracking-[0.15em] text-gold uppercase">
              −{discountPercent(product.priceCents, product.compareAtPriceCents!)}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge
              variant="secondary"
              className="rounded-none text-[10px] tracking-[0.15em] uppercase"
            >
              Agotado
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          {product.brandName}
        </p>
        <h3 className="text-sm leading-snug font-medium">{product.name}</h3>
        <p className="text-sm">
          <span className={onSale ? "font-medium text-destructive" : undefined}>
            {formatPrice(product.priceCents)}
          </span>
          {onSale && (
            <span className="ml-2 text-muted-foreground line-through">
              {formatPrice(product.compareAtPriceCents!)}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
