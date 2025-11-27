import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

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
};

export default withNextIntl(nextConfig);
