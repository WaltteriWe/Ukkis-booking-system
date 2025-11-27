import type { NextConfig } from "next";
<<<<<<< HEAD
=======
import createNextIntlPlugin from "next-intl/plugin";


const withNextIntl = createNextIntlPlugin();
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e

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

<<<<<<< HEAD
export default nextConfig;
=======
export default withNextIntl(nextConfig);
>>>>>>> c4502a66a64baff9a3b5e2c22d1ab8f4d932013e
