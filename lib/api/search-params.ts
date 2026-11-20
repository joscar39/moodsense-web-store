/**
 * Normaliza los `searchParams` de Next.js: si una clave viene repetida (array)
 * se queda con el primer valor. Para qué: los schemas Zod esperan escalares.
 *
 * @example
 * firstSearchParamValues({ brand: ["nike", "adidas"], page: "2" }); // { brand: "nike", page: "2" }
 */
export function firstSearchParamValues(
  params: Record<string, string | string[] | undefined>
): Record<string, string> {
  const entries: [string, string][] = [];
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") entries.push([key, value]);
    else if (Array.isArray(value) && typeof value[0] === "string") entries.push([key, value[0]]);
  }
  return Object.fromEntries(entries);
}
