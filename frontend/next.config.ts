import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // API routes are now handled by Next.js
  // The /api/v1/analyze route proxies to the NLP backend internally
};

export default nextConfig;
