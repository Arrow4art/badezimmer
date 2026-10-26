import type { NextConfig } from "next";
import store from "./data/store.json";

// Every https host a catalog image points at, so next/image accepts it.
// Derived from the catalog so adding a product never breaks /shop again.
const imageHosts = Array.from(
  new Set(
    ["cdn.shopify.com"].concat(
      store.products.flatMap((product) =>
        product.images
          .map((image) => {
            try {
              const url = new URL(image.src);
              return url.protocol === "https:" ? url.hostname : null;
            } catch {
              return null;
            }
          })
          .filter((host): host is string => host !== null),
      ),
    ),
  ),
).sort();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: imageHosts.map((hostname) => ({ protocol: "https" as const, hostname })),
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
