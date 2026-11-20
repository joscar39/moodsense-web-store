import { NextResponse } from "next/server";

import { deleteProduct, revalidateCatalog, updateProduct } from "@/lib/admin/products";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireAdmin } from "@/lib/auth/require-user";
import { adminProductSchema } from "@/lib/validators/admin";

type Context = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/products/[id] (solo ADMIN): reemplaza los datos del producto
 * (reconciliando variantes) y revalida el slug nuevo y el anterior.
 *
 * @example
 * // PATCH /api/admin/products/abc { ...producto completo }
 * // 200 { data: { id, slug, previousSlug } } · 400 · 403 · 404 · 409
 */
export async function PATCH(request: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body: unknown = await request.json();
    const input = adminProductSchema.parse(body);
    const result = await updateProduct(id, input);

    revalidateCatalog([result.slug, result.previousSlug]);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/products/[id] (solo ADMIN): borra el producto y revalida el catálogo.
 *
 * @example
 * // DELETE /api/admin/products/abc
 * // 200 { data: { deleted: true } } · 403 · 404
 */
export async function DELETE(_request: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const result = await deleteProduct(id);

    revalidateCatalog([result.slug]);
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
