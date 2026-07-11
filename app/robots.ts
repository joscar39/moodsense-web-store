import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private/operational areas and API endpoints are not for crawlers.
        disallow: ["/admin", "/account", "/api/", "/cart", "/checkout", "/login", "/register"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
