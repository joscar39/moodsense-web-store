import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { listBrands } from "@/lib/catalog/brands";

/**
 * GET /api/brands: marcas con su número de productos activos.
 *
 * @example
 * // GET /api/brands → 200 { data: [{ id, name, slug, productCount }] }
 */
export async function GET() {
  try {
    const brands = await listBrands();
    return NextResponse.json({ data: brands });
  } catch (error) {
    return handleApiError(error);
  }
}
