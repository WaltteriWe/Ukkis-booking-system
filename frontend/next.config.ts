import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // Disable ESLint during Docker builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during Docker builds
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "http://localhost:3001/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
