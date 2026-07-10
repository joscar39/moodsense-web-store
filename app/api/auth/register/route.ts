import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/handle-api-error";
import { registerUser } from "@/lib/auth/register-user";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const input = registerSchema.parse(body);
    const user = await registerUser(input);
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
