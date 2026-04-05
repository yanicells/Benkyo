import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["recharts"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization.minimize = true;
    }

    return config;
  },
};

export default nextConfig;
