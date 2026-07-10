import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Dev seed imagery; replaced by Vercel Blob in production (Phase 6).
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
