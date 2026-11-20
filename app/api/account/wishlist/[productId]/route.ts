import { NextResponse } from "next/server";

import { removeFromWishlist } from "@/lib/account/wishlist";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireUser } from "@/lib/auth/require-user";

/**
 * DELETE /api/account/wishlist/[productId]: quita un producto (idempotente).
 *
 * @example
 * // DELETE /api/account/wishlist/p1 → 200 { data: { removed: true } } · 401 sin sesión
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await requireUser();
    const { productId } = await context.params;
    await removeFromWishlist(user.id, productId);
    return NextResponse.json({ data: { removed: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
