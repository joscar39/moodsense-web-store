import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { listProducts } from "@/lib/catalog/products";
import { productListQuerySchema } from "@/lib/validators/catalog";

import type { NextRequest } from "next/server";

/**
 * GET /api/products: listado paginado de productos activos con filtros y orden.
 *
 * @example
 * // GET /api/products?category=ropa&minPrice=1000&sort=price-asc
 * // 200 { data: { items, page, perPage, total, totalPages } } · 400 query inválida
 */
export async function GET(request: NextRequest) {
  try {
    const query = productListQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await listProducts(query);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
