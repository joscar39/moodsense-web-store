import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Dev seed imagery.
      { protocol: "https", hostname: "placehold.co" },
      // Vercel Blob (admin image uploads).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  // Cabeceras de seguridad básicas para todo el sitio: impiden que la tienda
  // (incluido el admin) se muestre dentro de un iframe ajeno, que el navegador
  // "adivine" tipos de archivo y que se filtre la URL completa a otros sitios.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
