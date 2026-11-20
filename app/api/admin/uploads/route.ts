import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api/handle-api-error";
import { requireAdmin } from "@/lib/auth/require-user";

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * POST /api/admin/uploads (solo ADMIN): sube una imagen de producto a Vercel
 * Blob. Requiere BLOB_READ_WRITE_TOKEN (503 si falta — el formulario admin cae
 * a URLs manuales).
 *
 * @example
 * // POST /api/admin/uploads (multipart, campo "file": JPG/PNG/WebP/AVIF ≤ 4 MB)
 * // 201 { data: { url } } · 400 formato/tamaño · 403 · 503 sin token
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

    // Nombre aleatorio y tipo fijado por el servidor: nunca se usa el nombre
    // que manda el navegador (evita servir, por ejemplo, un ".html" disfrazado).
    const extension = file.type.split("/")[1];
    const blob = await put(`products/${crypto.randomUUID()}.${extension}`, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ data: { url: blob.url } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
