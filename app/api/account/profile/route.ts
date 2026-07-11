import { NextResponse } from "next/server";

import { updateProfile } from "@/lib/account/profile";
import { handleApiError } from "@/lib/api/handle-api-error";
import { requireUser } from "@/lib/auth/require-user";
import { profileSchema } from "@/lib/validators/account";

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body: unknown = await request.json();
    const input = profileSchema.parse(body);
    const profile = await updateProfile(user.id, input);
    return NextResponse.json({ data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}
