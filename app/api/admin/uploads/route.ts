import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api/handle-api-error";
import { requireAdmin } from "@/lib/auth/require-user";

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Sube una imagen de producto a Vercel Blob. Requiere BLOB_READ_WRITE_TOKEN
 * (503 si no está configurado — el formulario admin cae a URLs manuales).
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new ApiError(
        "UPLOADS_NOT_CONFIGURED",
        "La subida de imágenes no está configurada (falta BLOB_READ_WRITE_TOKEN).",
        503
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError("VALIDATION_ERROR", "Falta el archivo a subir.", 400);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Formato no soportado (usa JPG, PNG, WebP o AVIF).",
        400
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new ApiError("VALIDATION_ERROR", "La imagen supera el máximo de 4 MB.", 400);
    }

    const blob = await put(`products/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ data: { url: blob.url } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
