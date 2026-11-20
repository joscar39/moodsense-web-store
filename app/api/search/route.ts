import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { searchProducts } from "@/lib/search/search-products";
import { searchQuerySchema } from "@/lib/validators/catalog";

import type { NextRequest } from "next/server";

/**
 * GET /api/search: búsqueda de texto libre (Meilisearch) con los filtros del PLP.
 *
 * @example
 * // GET /api/search?q=hoodie&brand=nocturne
 * // 200 { data: { items, query, total, ... } } · 400 sin q · 503 índice no sincronizado
 */
export async function GET(request: NextRequest) {
  try {
    const query = searchQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await searchProducts(query);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
