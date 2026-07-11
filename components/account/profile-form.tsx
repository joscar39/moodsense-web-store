"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileSchema } from "@/lib/validators/account";

import type { ProfileInput } from "@/lib/validators/account";

export function ProfileForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: defaultName },
  });

  const onSubmit = handleSubmit(async (data) => {
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      toast.error("No se pudo guardar el perfil.");
      return;
    }
    toast.success("Perfil actualizado.");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4" noValidate>
      <div>
        <Label htmlFor="profile-name">Nombre</Label>
        <Input id="profile-name" autoComplete="name" className="mt-1.5" {...register("name")} />
        <FieldError message={errors.name?.message} />
      </div>
      <Button
        type="submit"
        className="rounded-none tracking-[0.15em] uppercase"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
