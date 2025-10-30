import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // Enable for Docker deployment

  /* config options here */
};

export default nextConfig;
