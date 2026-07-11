import { NextResponse } from "next/server";

import { createAddress, listAddresses } from "@/lib/account/addresses";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireUser } from "@/lib/auth/require-user";
import { addressSchema } from "@/lib/validators/account";

export async function GET() {
  try {
    const user = await requireUser();
    const addresses = await listAddresses(user.id);
    return NextResponse.json({ data: addresses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body: unknown = await request.json();
    const input = addressSchema.parse(body);
    const address = await createAddress(user.id, input);
    return NextResponse.json({ data: address }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
