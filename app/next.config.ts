import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force dynamic rendering for all pages (CSR approach)
  experimental: {
    forceSwcTransforms: true,
  },
  // Optimize for standalone deployment
  output: 'standalone',
  // Ensure client-side rendering
  reactStrictMode: true,
  // Force dynamic rendering
  trailingSlash: false,
};

export default nextConfig;
