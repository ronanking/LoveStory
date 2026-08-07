import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Transpile the three.js ecosystem — drei ships untranspiled ESM.
  transpilePackages: ["three"],
};

export default nextConfig;
