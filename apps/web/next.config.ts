import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.pandascore.co" },
      { protocol: "https", hostname: "**.pandascore.co" },
    ],
  },
};

export default config;
