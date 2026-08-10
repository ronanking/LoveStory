import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Transpile the three.js ecosystem — drei ships untranspiled ESM.
  transpilePackages: ["three"],
  images: {
    // Only consulted when NEXT_PUBLIC_IMAGE_BASE points at this host; the
    // default build serves everything from public/ and never touches it.
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
