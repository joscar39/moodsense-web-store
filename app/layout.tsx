import type { Metadata } from "next";
import { Archivo, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
