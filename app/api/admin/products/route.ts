import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { createProduct } from "@/lib/admin/products";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireAdmin } from "@/lib/auth/require-user";
import { adminProductSchema } from "@/lib/validators/admin";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body: unknown = await request.json();
    const input = adminProductSchema.parse(body);
    const product = await createProduct(input);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
