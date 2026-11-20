"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format/price";

/** Categoría raíz con sus subcategorías, tal como se lista en el panel de filtros. */
export type FilterCategory = {
  slug: string;
  name: string;
  children: { slug: string; name: string; productCount: number }[];
};

/** Marca con su cantidad de productos activos. */
export type FilterBrand = { slug: string; name: string; productCount: number };

// Opciones del filtro de género (valor del enum en la URL → etiqueta visible).
const GENDER_OPTIONS = [
  { value: "MEN", label: "Hombre" },
  { value: "WOMEN", label: "Mujer" },
  { value: "UNISEX", label: "Unisex" },
] as const;

/**
 * Panel de filtros del catálogo (categoría, marca, género, precio y rebajas).
 * Los filtros viven en la URL para que el PLP siga siendo Server Component: cada
 * cambio empuja nuevos search params y el servidor vuelve a renderizar la grilla.
 *
 * @example
 * <FiltersPanel categories={categories} brands={brands} />
 * // Elegir "Mujer" → /products?gender=WOMEN
 */
export function FiltersPanel({
  categories,
  brands,
}: {
  categories: FilterCategory[];
  brands: FilterBrand[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = (key: string) => searchParams.get(key);

  // Aplica cambios a la URL (null o "" borra la clave) y navega sin mover el scroll.
  // Ej.: setParams({ brand: "atlas-supply", onSale: null })
  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    params.delete("page"); // cualquier cambio de filtro vuelve a la página 1
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Estilo de los filtros tipo enlace: subrayado cuando están activos.
  const linkClass = (active: boolean) =>
    `block py-1 text-sm transition-colors ${
      active
        ? "font-medium underline underline-offset-4"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-xs tracking-[0.25em] uppercase">Categoría</h3>
        <button
          type="button"
          onClick={() => setParams({ category: null })}
          className={linkClass(!current("category"))}
        >
          Todas
        </button>
        {categories.map((category) => (
          <div key={category.slug}>
            <button
              type="button"
              onClick={() => setParams({ category: category.slug })}
              className={linkClass(current("category") === category.slug)}
            >
              {category.name}
            </button>
            {category.children.length > 0 && (
              <div className="ml-3">
                {category.children.map((child) => (
                  <button
                    key={child.slug}
                    type="button"
                    onClick={() => setParams({ category: child.slug })}
                    className={linkClass(current("category") === child.slug)}
                  >
                    {child.name} <span className="opacity-50">({child.productCount})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      <Separator />

      <section>
        <h3 className="mb-2 text-xs tracking-[0.25em] uppercase">Marca</h3>
        <button
          type="button"
          onClick={() => setParams({ brand: null })}
          className={linkClass(!current("brand"))}
        >
          Todas
        </button>
        {brands.map((brand) => (
          <button
            key={brand.slug}
            type="button"
            onClick={() => setParams({ brand: brand.slug })}
            className={linkClass(current("brand") === brand.slug)}
          >
            {brand.name} <span className="opacity-50">({brand.productCount})</span>
          </button>
        ))}
      </section>

      <Separator />

      <section>
        <h3 className="mb-3 text-xs tracking-[0.25em] uppercase">Género</h3>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((option) => {
            const active = current("gender") === option.value;
            return (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                className="rounded-none text-xs tracking-[0.15em] uppercase"
                onClick={() => setParams({ gender: active ? null : option.value })}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </section>

      <Separator />

      <section>
        <h3 className="mb-3 text-xs tracking-[0.25em] uppercase">Precio</h3>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            // Convierte los dólares escritos a centavos (la API trabaja en centavos); vacío → sin filtro.
            const toCents = (raw: FormDataEntryValue | null) => {
              const dollars = Number(raw);
              return raw && Number.isFinite(dollars) && dollars > 0
                ? String(Math.round(dollars * 100))
                : null;
            };
            setParams({ minPrice: toCents(data.get("min")), maxPrice: toCents(data.get("max")) });
          }}
        >
          <Input
            type="number"
            name="min"
            min={0}
            placeholder="Mín $"
            aria-label="Precio mínimo en dólares"
            defaultValue={current("minPrice") ? Number(current("minPrice")) / 100 : ""}
            className="h-9"
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            name="max"
            min={0}
            placeholder="Máx $"
            aria-label="Precio máximo en dólares"
            defaultValue={current("maxPrice") ? Number(current("maxPrice")) / 100 : ""}
            className="h-9"
          />
          <Button type="submit" size="sm" variant="outline" className="rounded-none">
            OK
          </Button>
        </form>
        {(current("minPrice") || current("maxPrice")) && (
          <p className="mt-2 text-xs text-muted-foreground">
            {current("minPrice") ? formatPrice(Number(current("minPrice"))) : "…"} —{" "}
            {current("maxPrice") ? formatPrice(Number(current("maxPrice"))) : "…"}
          </p>
        )}
      </section>

      <Separator />

      <section className="flex items-center gap-2">
        <Checkbox
          id="filter-on-sale"
          checked={current("onSale") === "true"}
          onCheckedChange={(checked) => setParams({ onSale: checked ? "true" : null })}
        />
        <Label htmlFor="filter-on-sale" className="text-sm">
          Solo rebajas
        </Label>
      </section>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full text-xs tracking-[0.2em] text-muted-foreground uppercase"
        onClick={() => router.push(pathname, { scroll: false })}
      >
        Limpiar filtros
      </Button>
    </div>
  );
}
