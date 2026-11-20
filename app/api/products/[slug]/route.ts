import { NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api/handle-api-error";
import { getProductBySlug } from "@/lib/catalog/products";

/**
 * GET /api/products/[slug]: detalle de un producto activo (marca, categoría,
 * imágenes y variantes).
 *
 * @example
 * // GET /api/products/oversized-tee
 * // 200 { data: { id, name, variants: [...] } } · 404 { error: { code: "NOT_FOUND" } }
 */
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const product = await getProductBySlug(slug);
    if (!product) throw new ApiError("NOT_FOUND", "Producto no encontrado.", 404);
    return NextResponse.json({ data: product });
  } catch (error) {
    return handleApiError(error);
  }
}
