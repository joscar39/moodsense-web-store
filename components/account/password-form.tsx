"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readApiError } from "@/lib/api/client-errors";
import { passwordChangeSchema } from "@/lib/validators/account";

import type { PasswordChangeInput } from "@/lib/validators/account";

/**
 * Formulario para cambiar la contraseña (pide la actual y la nueva) contra
 * POST /api/account/password; avisa con un toast y limpia los campos al terminar.
 *
 * @example
 * <PasswordForm />
 */
export function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordChangeInput>({ resolver: zodResolver(passwordChangeSchema) });

  const onSubmit = handleSubmit(async (data) => {
    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      toast.error((await readApiError(response)) ?? "No se pudo cambiar la contraseña.");
      return;
    }
    toast.success("Contraseña actualizada.");
    reset();
  });

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4" noValidate>
      <div>
        <Label htmlFor="current-password">Contraseña actual</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          className="mt-1.5"
          {...register("currentPassword")}
        />
        <FieldError message={errors.currentPassword?.message} />
      </div>
      <div>
        <Label htmlFor="new-password">Nueva contraseña</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          className="mt-1.5"
          {...register("newPassword")}
        />
        <FieldError message={errors.newPassword?.message} />
      </div>
      <Button
        type="submit"
        variant="outline"
        className="rounded-none tracking-[0.15em] uppercase"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Cambiando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
