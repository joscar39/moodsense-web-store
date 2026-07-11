import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdminPage } from "@/lib/auth/require-admin-page";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Mood Sense" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Mood Sense · Panel
          </p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Administración</h1>
        </div>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </header>
      <div className="grid gap-10 lg:grid-cols-[180px_1fr]">
        <AdminNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
