import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/checkout/create-checkout-session";
import { checkoutSchema } from "@/lib/validators/checkout";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = checkoutSchema.parse(body);

    const session = await auth();
    const user =
      session?.user?.id && session.user.email
        ? { id: session.user.id, email: session.user.email }
        : null;

    const result = await createCheckoutSession(input, user);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
