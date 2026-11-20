"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { readApiError } from "@/lib/api/client-errors";
import { adminProductFormSchema, toAdminProductPayload } from "@/lib/validators/admin";

import type { AdminProductFormValues } from "@/lib/validators/admin";

type SelectOption = { id: string; name: string };

const GENDER_OPTIONS = [
  { value: "UNISEX", label: "Unisex" },
  { value: "MEN", label: "Hombre" },
  { value: "WOMEN", label: "Mujer" },
];

const selectClass =
  "border-input bg-background mt-1.5 h-9 w-full rounded-md border px-3 text-sm shadow-xs";

/**
 * Genera un slug kebab-case sin acentos a partir del nombre.
 *
 * @example
 * slugify("Camiseta Básica Negra"); // "camiseta-basica-negra"
 */
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Formulario de alta/edición de producto del admin (precios en USD, imágenes
 * por subida o URL y variantes). Valida con zod, convierte a centavos y envía
 * POST (crear) o PATCH (editar con `productId`).
 *
 * @example
 * <ProductForm productId={product.id} defaultValues={values} brands={brands} categories={categories} />
 */
export function ProductForm({
  productId,
  defaultValues,
  brands,
  categories,
}: {
  /** Presente al editar; ausente al crear. */
  productId?: string;
  defaultValues: AdminProductFormValues;
  brands: SelectOption[];
  categories: SelectOption[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdminProductFormValues>({
    resolver: zodResolver(adminProductFormSchema),
    defaultValues,
  });

  const variantsArray = useFieldArray({ control, name: "variants" });
  const imagesArray = useFieldArray({ control, name: "images" });

  const onSubmit = handleSubmit(async (values) => {
    const payload = toAdminProductPayload(adminProductFormSchema.parse(values));
    const response = await fetch(
      productId ? `/api/admin/products/${productId}` : "/api/admin/products",
      {
        method: productId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      toast.error((await readApiError(response)) ?? "No se pudo guardar el producto.");
      return;
    }
    toast.success(productId ? "Producto actualizado." : "Producto creado.");
    router.push("/admin/products");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-8" noValidate>
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="p-name">Nombre</Label>
          <Input
            id="p-name"
            className="mt-1.5"
            {...register("name")}
            onBlur={() => {
              if (!getValues("slug")) setValue("slug", slugify(getValues("name") ?? ""));
            }}
          />
          <FieldError message={errors.name?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="p-slug">Slug</Label>
          <Input id="p-slug" className="mt-1.5 font-mono" {...register("slug")} />
          <FieldError message={errors.slug?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="p-description">Descripción</Label>
          <textarea
            id="p-description"
            rows={4}
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>
        <div>
          <Label htmlFor="p-brand">Marca</Label>
          <select id="p-brand" className={selectClass} {...register("brandId")}>
            <option value="">— Elegir —</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.brandId?.message} />
        </div>
        <div>
          <Label htmlFor="p-category">Categoría</Label>
          <select id="p-category" className={selectClass} {...register("categoryId")}>
            <option value="">— Elegir —</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.categoryId?.message} />
        </div>
        <div>
          <Label htmlFor="p-gender">Género</Label>
          <select id="p-gender" className={selectClass} {...register("gender")}>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-6 pb-1">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4" {...register("isActive")} /> Activo
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4" {...register("isFeatured")} /> Destacado
          </label>
        </div>
        <div>
          <Label htmlFor="p-price">Precio (USD)</Label>
          <Input
            id="p-price"
            type="number"
            step="0.01"
            min="0"
            className="mt-1.5"
            {...register("priceUsd")}
          />
          <FieldError message={errors.priceUsd?.message} />
        </div>
        <div>
          <Label htmlFor="p-compare">Precio de comparación (USD, opcional)</Label>
          <Input
            id="p-compare"
            type="number"
            step="0.01"
            min="0"
            className="mt-1.5"
            {...register("compareAtPriceUsd")}
          />
          <FieldError message={errors.compareAtPriceUsd?.message} />
        </div>
      </section>

      <Separator />

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs tracking-[0.25em] uppercase">Imágenes</h3>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setUploading(true);
                try {
                  const formData = new FormData();
                  formData.append("file", file);
                  const response = await fetch("/api/admin/uploads", {
                    method: "POST",
                    body: formData,
                  });
                  if (!response.ok) {
                    toast.error((await readApiError(response)) ?? "No se pudo subir la imagen.");
                    return;
                  }
                  const body = (await response.json()) as { data: { url: string } };
                  imagesArray.append({ url: body.data.url, alt: "" });
                  toast.success("Imagen subida. Completa el texto alternativo.");
                } finally {
                  setUploading(false);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={uploading || imagesArray.fields.length >= 6}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon className="mr-1 size-4" /> {uploading ? "Subiendo…" : "Subir archivo"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={() => imagesArray.append({ url: "", alt: "" })}
              disabled={imagesArray.fields.length >= 6}
            >
              <PlusIcon className="mr-1 size-4" /> URL
            </Button>
          </div>
        </div>
        {imagesArray.fields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Sin imágenes. Se mostrará un placeholder en la tienda. Sube un archivo (requiere Vercel
            Blob configurado) o pega una URL.
          </p>
        )}
        <div className="space-y-3">
          {imagesArray.fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1">
                <Input placeholder="https://…" {...register(`images.${index}.url`)} />
                <FieldError message={errors.images?.[index]?.url?.message} />
              </div>
              <div className="flex-1">
                <Input placeholder="Texto alternativo" {...register(`images.${index}.alt`)} />
                <FieldError message={errors.images?.[index]?.alt?.message} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar imagen"
                onClick={() => imagesArray.remove(index)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs tracking-[0.25em] uppercase">Variantes</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => variantsArray.append({ sku: "", size: "", color: "", stock: 0 })}
          >
            <PlusIcon className="mr-1 size-4" /> Variante
          </Button>
        </div>
        {typeof errors.variants?.message === "string" && (
          <FieldError message={errors.variants.message} />
        )}
        <div className="space-y-3">
          {variantsArray.fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-2 items-start gap-2 border p-3 sm:grid-cols-[1fr_80px_110px_90px_90px_auto]"
            >
              <div>
                <Input
                  placeholder="SKU"
                  className="font-mono"
                  {...register(`variants.${index}.sku`)}
                />
                <FieldError message={errors.variants?.[index]?.sku?.message} />
              </div>
              <Input placeholder="Talla" {...register(`variants.${index}.size`)} />
              <Input placeholder="Color" {...register(`variants.${index}.color`)} />
              <div>
                <Input
                  placeholder="$ opc."
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`variants.${index}.priceUsd`)}
                />
                <FieldError message={errors.variants?.[index]?.priceUsd?.message} />
              </div>
              <div>
                <Input
                  placeholder="Stock"
                  type="number"
                  min="0"
                  {...register(`variants.${index}.stock`)}
                />
                <FieldError message={errors.variants?.[index]?.stock?.message} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar variante"
                onClick={() => variantsArray.remove(index)}
                disabled={variantsArray.fields.length <= 1}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <Button
          type="submit"
          size="lg"
          className="rounded-none px-10 tracking-[0.2em] uppercase"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando…" : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.push("/admin/products")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
