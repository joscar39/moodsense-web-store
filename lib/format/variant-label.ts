/**
 * Texto corto que describe una variante: color y talla separados por " · ".
 * Devuelve `null` si la variante no tiene ninguno de los dos.
 *
 * @example
 * variantLabel("Negro", "M");   // "Negro · M"
 * variantLabel(null, "42");     // "42"
 * variantLabel(null, null);     // null
 */
export function variantLabel(color: string | null, size: string | null): string | null {
  return [color, size].filter(Boolean).join(" · ") || null;
}
