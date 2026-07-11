import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { deleteProduct, updateProduct } from "@/lib/admin/products";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireAdmin } from "@/lib/auth/require-user";
import { adminProductSchema } from "@/lib/validators/admin";

type Context = { params: Promise<{ id: string }> };

function revalidateCatalog(slugs: (string | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/products");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/products/${slug}`);
  }
}

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
