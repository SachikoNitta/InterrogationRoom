import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static optimization for pages that use Firebase
  experimental: {
    // Force dynamic rendering to avoid build-time Firebase issues
    forceSwcTransforms: true,
  },
  // Ensure client-side rendering for Firebase-dependent pages
  reactStrictMode: true,
};

export default nextConfig;
