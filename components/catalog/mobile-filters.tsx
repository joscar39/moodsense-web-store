"use client";

import { SlidersHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { FiltersPanel } from "./filters-panel";

import type { FilterBrand, FilterCategory } from "./filters-panel";

/**
 * Botón "Filtros" para móvil que abre `FiltersPanel` en un panel lateral. Oculto en desktop.
 *
 * @example
 * <MobileFilters categories={categories} brands={brands} />
 */
export function MobileFilters({
  categories,
  brands,
}: {
  categories: FilterCategory[];
  brands: FilterBrand[];
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="rounded-none lg:hidden">
            <SlidersHorizontalIcon className="mr-2 size-4" /> Filtros
          </Button>
        }
      />
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xs tracking-[0.25em] uppercase">Filtros</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-8">
          <FiltersPanel categories={categories} brands={brands} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
