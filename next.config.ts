import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  typescript: {
    // !! 警告: 仅在构建时禁用类型检查
    ignoreBuildErrors: true,
  },
};

export default nextConfig;