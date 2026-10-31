import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,

  async rewrites() {
    const backendTarget = (process.env.BACKEND_PROXY_URL || "http://192.168.0.142:8081").replace(/\/$/, "");
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${backendTarget}/:path*`,
      },
    ];
  },

  webpack: (config) => {
    // Fix Windows path-casing bug: Next.js's internal build loader (next-flight-client-module-loader)
    // references the same files via both C:\ (uppercase) and c:\ (lowercase) paths.
    // Webpack treats these as separate modules, producing two React instances with separate
    // ReactCurrentDispatcher singletons. Client-component hooks (useState, useCallback…) then
    // call the dispatcher from one copy while the renderer set it up in the other → null crash.
    // Aliasing React to a single canonical absolute path collapses both copies into one.
    const reactDir = path.resolve(process.cwd(), "node_modules", "react");
    config.resolve.alias = {
      ...config.resolve.alias,
      react: reactDir,
      "react-dom": path.resolve(process.cwd(), "node_modules", "react-dom"),
      "react/jsx-runtime": path.resolve(reactDir, "jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(reactDir, "jsx-dev-runtime"),
    };
    return config;
  },
};

export default nextConfig;
