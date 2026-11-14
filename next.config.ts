import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const backendUrl = (
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://192.168.0.138:8080"
    ).replace(/\/$/, "");

    const storeUrl = (
      process.env.BACKEND_STORE_URL ||
      process.env.NEXT_PUBLIC_STORE_API_BASE_URL ||
      "http://192.168.0.138:8090"
    ).replace(/\/$/, "");

    return {
      beforeFiles: [
        // Route all Store Service calls directly to Store Microservice on Port 8090
        {
          source: "/api/store/:path*",
          destination: `${storeUrl}/api/store/:path*`,
        },
        {
          source: "/api/admin/store/:path*",
          destination: `${storeUrl}/api/admin/store/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [
        {
          source: "/api/:path*",
          destination: `${backendUrl}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
