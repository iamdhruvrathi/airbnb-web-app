import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async rewrites() {
    const isDev = process.env.NODE_ENV === "development";
    const rewrites = [] as any[];
    if (isDev) {
      rewrites.push({ source: "/api/:path*", destination: "http://localhost:8000/api/:path*" });
    }
    return rewrites;
  },
};

export default nextConfig;
