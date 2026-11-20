import { NextResponse } from "next/server";

import { createProduct, revalidateCatalog } from "@/lib/admin/products";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireAdmin } from "@/lib/auth/require-user";
import { adminProductSchema } from "@/lib/validators/admin";

/**
 * POST /api/admin/products (solo ADMIN): crea un producto y revalida el catálogo.
 *
 * @example
 * // POST /api/admin/products { name, slug, priceCents, variants: [...] }
 * // 201 { data: { id, slug } } · 400 validación · 403 no admin · 409 slug/SKU duplicado
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body: unknown = await request.json();
    const input = adminProductSchema.parse(body);
    const product = await createProduct(input);

    revalidateCatalog([product.slug]);
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
