import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
  output: 'standalone',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
