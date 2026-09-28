import type { NextConfig } from "next";

const defaultBackend = process.env.NODE_ENV === "production" || process.env.VERCEL
  ? "https://metroniq-backend-production.up.railway.app"
  : "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : `${defaultBackend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
