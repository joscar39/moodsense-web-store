import { NextResponse } from "next/server";

import { changePassword } from "@/lib/account/profile";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireUser } from "@/lib/auth/require-user";
import { passwordChangeSchema } from "@/lib/validators/account";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body: unknown = await request.json();
    const input = passwordChangeSchema.parse(body);
    await changePassword(user.id, input);
    return NextResponse.json({ data: { updated: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
