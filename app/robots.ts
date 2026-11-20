import type { MetadataRoute } from "next";

/**
 * Genera `/robots.txt`: permite indexar la tienda, bloquea las áreas privadas y la API,
 * e indica a los buscadores dónde está el sitemap.
 *
 * @example
 * // GET /robots.txt → User-Agent: * · Allow: / · Disallow: /admin, /account, /api/…
 * //                   Sitemap: https://midominio.com/sitemap.xml
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Las áreas privadas/operativas y los endpoints de API no son para buscadores.
        disallow: ["/admin", "/account", "/api/", "/cart", "/checkout", "/login", "/register"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
