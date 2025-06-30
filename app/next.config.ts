import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for standalone deployment
  output: 'standalone',
  // Ensure client-side rendering
  reactStrictMode: true,
  // Force dynamic rendering
  trailingSlash: false,
};

export default nextConfig;
