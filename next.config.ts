import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
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
