"use client";

import { LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

/**
 * Botón "Cerrar sesión": cierra la sesión de Auth.js y vuelve a la home.
 *
 * @example
 * <SignOutButton />
 */
export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="px-3 text-muted-foreground"
      onClick={() => signOut({ redirectTo: "/" })}
    >
      <LogOutIcon className="mr-2 size-4" /> Cerrar sesión
    </Button>
  );
}
