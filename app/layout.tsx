import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

// Fuentes variables self-hosted (app/fonts/, subset latin): el build no depende de
// la red para bajar Google Fonts (se colgaba/fallaba detrás de VPNs/firewalls).
const sans = localFont({
  src: "./fonts/archivo-variable.woff2",
  weight: "100 900",
  variable: "--font-sans",
});

const serif = localFont({
  src: [
    { path: "./fonts/playfair-variable.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/playfair-italic-variable.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--font-serif",
});

const mono = localFont({
  src: "./fonts/geist-mono-variable.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
});

/** Metadatos SEO globales (título con plantilla, descripción, Open Graph) que heredan todas las páginas. */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Mood Sense — Wear your vibe. Make the match.",
    template: "%s · Mood Sense",
  },
  description:
    "Curated multi-brand concept store. Head-to-toe style: premium streetwear, modern casual and accessible luxury for men and women.",
  openGraph: {
    type: "website",
    siteName: "Mood Sense",
    locale: "es",
    // La imagen OG (1200×630) se añadirá como app/opengraph-image.png cuando
    // el diseñador la entregue (ver docs/brand-assets-spec.md §3).
  },
  twitter: { card: "summary_large_image" },
};

/** Viewport móvil y color de la barra del navegador (crema de marca). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F5F3EF",
};

/**
 * Layout raíz de toda la app: define `<html lang="es">`, carga las fuentes de marca
 * como variables CSS y monta el contenedor global de toasts (avisos emergentes).
 *
 * @example
 * // Next.js lo aplica solo a todas las rutas; envuelve a app/(shop)/layout.tsx,
 * // app/admin/layout.tsx, etc. No se importa a mano.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${sans.variable} ${serif.variable} ${mono.variable} antialiased`}>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
