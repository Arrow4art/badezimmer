import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/s/files/**" },
    ],
  },
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/*": ["./data/store.json"],
    "/api/*": ["./data/store.json"],
    "/produkt/*": ["./data/store.json"],
    "/bestellung/*": ["./data/store.json"],
    "/kasse/*": ["./data/store.json"],
  },
};

export default nextConfig;
