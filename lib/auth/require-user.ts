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

/** Route-handler guard for admin endpoints: 401 anonymous, 403 non-admin. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new ApiError("FORBIDDEN", "Requiere rol de administrador.", 403);
  }
  return user;
}
