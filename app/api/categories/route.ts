import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { listCategoryTree } from "@/lib/catalog/categories";

/**
 * GET /api/categories: árbol de categorías (2 niveles) con productos activos por categoría.
 *
 * @example
 * // GET /api/categories → 200 { data: [{ slug: "ropa", productCount, children: [...] }] }
 */
export async function GET() {
  try {
    const categories = await listCategoryTree();
    return NextResponse.json({ data: categories });
  } catch (error) {
    return handleApiError(error);
  }
}
