import { NextResponse } from "next/server";

import { addToWishlist, listWishlistProductIds } from "@/lib/account/wishlist";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireUser } from "@/lib/auth/require-user";
import { wishlistToggleSchema } from "@/lib/validators/account";

export async function GET() {
  try {
    const user = await requireUser();
    const productIds = await listWishlistProductIds(user.id);
    return NextResponse.json({ data: { productIds } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body: unknown = await request.json();
    const { productId } = wishlistToggleSchema.parse(body);
    await addToWishlist(user.id, productId);
    return NextResponse.json({ data: { added: true } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
