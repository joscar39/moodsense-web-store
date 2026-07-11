import { redirect } from "next/navigation";

import { auth } from "./index";

/**
 * Page-level admin guard (defense in depth on top of the middleware):
 * anonymous users go to /login, non-admins to the storefront.
 */
export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=%2Fadmin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session.user;
}
