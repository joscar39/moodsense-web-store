/**
 * Next.js `searchParams` values can be arrays (repeated keys); Zod schemas
 * expect scalars, so keep the first occurrence and drop the rest.
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
