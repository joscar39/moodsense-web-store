import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

/**
 * Error de negocio con código estable, status HTTP y detalle opcional. Lo lanzan
 * los servicios y `handleApiError` lo convierte en respuesta.
 *
 * @example
 * throw new ApiError("EMAIL_TAKEN", "Ya existe una cuenta con este email.", 409);
 */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown };
};

/**
 * Indica si `error` es un error de Prisma con ese código (p. ej. "P2002").
 * Se comprueba por forma para no importar el cliente de Prisma en este módulo.
 */
function isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

/**
 * Traduce cualquier error de un route handler a `{ error: { code, message } }`:
 * ZodError → 400, ApiError → su status, P2002 → 409, P2003 → 404, JSON
 * malformado → 400 y el resto → 500 opaco (el detalle solo va al log del servidor).
 *
 * @example
 * export async function POST(request: Request) {
 *   try { ... } catch (error) { return handleApiError(error); }
 * }
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Datos inválidos.",
          details: z.flattenError(error).fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined && { details: error.details }),
        },
      },
      { status: error.status }
    );
  }

  // Violación de unicidad de Prisma (P2002), p. ej. slug o SKU duplicado.
  if (isPrismaError(error, "P2002")) {
    return NextResponse.json(
      {
        error: {
          code: "CONFLICT",
          message: "Ya existe un registro con ese valor único (slug o SKU).",
        },
      },
      { status: 409 }
    );
  }

  // Violación de clave foránea de Prisma (P2003): el registro referenciado no
  // existe (p. ej. añadir a la wishlist un producto borrado).
  if (isPrismaError(error, "P2003")) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "El recurso relacionado no existe." } },
      { status: 404 }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "El cuerpo de la petición no es JSON válido." } },
      { status: 400 }
    );
  }

  // Solo el mensaje: el objeto completo puede arrastrar datos de la consulta.
  console.error("[api] unhandled error:", error instanceof Error ? error.message : error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Error interno del servidor." } },
    { status: 500 }
  );
}
