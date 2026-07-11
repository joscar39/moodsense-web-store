import { ApiError } from "@/lib/api/handle-api-error";

import { auth } from "./index";

/**
 * Route-handler guard: returns the authenticated user or throws 401
 * (mapped by handleApiError). Pages use auth() + redirect instead.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ApiError("UNAUTHORIZED", "Debes iniciar sesión.", 401);
  }
  return { id: session.user.id, email: session.user.email ?? "", role: session.user.role };
}
