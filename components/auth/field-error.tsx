/**
 * Mensaje de error bajo un campo de formulario; no renderiza nada si no hay mensaje.
 *
 * @example
 * <FieldError message={errors.email?.message} />
 */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}
