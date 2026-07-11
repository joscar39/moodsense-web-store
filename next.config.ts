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
};

export default nextConfig;
