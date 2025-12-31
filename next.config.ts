import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nvayrzqljogvaaxfpryz.supabase.co",
        port: "",
        pathname: "/storage/**",
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
