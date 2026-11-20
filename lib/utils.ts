import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases CSS condicionales y resuelve conflictos de Tailwind (gana la última).
 * Permite que los componentes acepten un `className` extra sin duplicar estilos.
 *
 * @example
 * cn("px-2 py-1", isActive && "bg-ink", "px-4"); // → "py-1 bg-ink px-4" (si isActive)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
