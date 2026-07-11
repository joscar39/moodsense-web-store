import { NextResponse } from "next/server";

import { handleApiError, ApiError } from "@/lib/api/handle-api-error";
import { auth } from "@/lib/auth";
import { createManualOrder } from "@/lib/checkout/create-manual-order";
import { manualCheckoutSchema } from "@/lib/validators/checkout";

export async function POST(request: Request) {
  try {
    if (process.env.NEXT_PUBLIC_CHECKOUT_MODE === "stripe") {
      throw new ApiError("CHECKOUT_MODE", "El checkout manual no está activo.", 409);
    }

    const body: unknown = await request.json();
    const input = manualCheckoutSchema.parse(body);

    const session = await auth();
    const user =
      session?.user?.id && session.user.email
        ? { id: session.user.id, email: session.user.email }
        : null;

    const result = await createManualOrder(input, user);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
