/**
 * Devuelve `raw` solo si es una ruta interna del sitio; si no, `/account`.
 *
 * Para qué: los formularios de login y registro redirigen a `?callbackUrl=...`
 * al terminar. Sin este filtro, un enlace como
 * `/login?callbackUrl=https://sitio-falso.com` mandaría al usuario recién
 * logueado a una página de phishing.
 *
 * @example
 * safeCallbackUrl("/admin");               // "/admin"
 * safeCallbackUrl("https://evil.com");     // "/account"
 * safeCallbackUrl("//evil.com");           // "/account"
 * safeCallbackUrl(null);                   // "/account"
 */
export function safeCallbackUrl(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\")) {
    return raw;
  }
  return "/account";
}
