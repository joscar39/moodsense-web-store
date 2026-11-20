/**
 * Lee el mensaje de error de una respuesta de nuestra API (`{ error: { message } }`).
 * Devuelve `undefined` si la respuesta no trae un mensaje (o no es JSON).
 *
 * Para qué: los formularios del navegador muestran este texto en un aviso.
 *
 * @example
 * const response = await fetch("/api/account/addresses", { method: "POST", body });
 * if (!response.ok) toast.error((await readApiError(response)) ?? "No se pudo guardar.");
 */
export async function readApiError(response: Response): Promise<string | undefined> {
  const body: unknown = await response.json().catch(() => null);
  return (body as { error?: { message?: string } } | null)?.error?.message;
}
