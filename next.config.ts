import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["recharts"],
  },
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/.pnpm/@libsql+client@*/node_modules/@libsql/client/lib-esm/web.js",
      "./node_modules/.pnpm/@libsql+client@*/node_modules/@libsql/client/lib-cjs/web.js",
      "./node_modules/.pnpm/@libsql+isomorphic-ws@*/node_modules/@libsql/isomorphic-ws/web.mjs",
      "./node_modules/.pnpm/@libsql+isomorphic-ws@*/node_modules/@libsql/isomorphic-ws/web.cjs",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.minimize = true;
    }

    return config;
  },
};

export default nextConfig;
