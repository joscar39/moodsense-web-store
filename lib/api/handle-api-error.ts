import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

/** Error with a stable machine-readable code and HTTP status, thrown from services. */
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
 * Central error mapper for all route handlers: ZodError → 400, ApiError → its
 * status, malformed JSON → 400, anything else → opaque 500 (internals are
 * logged server-side, never leaked to the client).
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

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "El cuerpo de la petición no es JSON válido." } },
      { status: 400 }
    );
  }

  console.error("[api] unhandled error:", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Error interno del servidor." } },
    { status: 500 }
  );
}
