import type { Metadata } from "next";
import localFont from "next/font/local";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

// Self-hosted variable fonts (app/fonts/, latin subset): no build-time
// network dependency on Google Fonts (builds hang/fail behind VPNs/firewalls).
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

export const metadata: Metadata = {
  title: {
    default: "Mood Sense — Wear your vibe. Make the match.",
    template: "%s · Mood Sense",
  },
  description:
    "Curated multi-brand concept store. Head-to-toe style: premium streetwear, modern casual and accessible luxury for men and women.",
};

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
