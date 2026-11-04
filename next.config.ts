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
  // The shop's old German addresses, still used by bookmarks, ads and search results.
  async redirects() {
    const moved = [
      ["/kasse/abbruch", "/checkout/cancel"],
      ["/kasse", "/checkout"],
      ["/warenkorb", "/cart"],
      ["/versand", "/shipping"],
      ["/widerruf", "/returns"],
      ["/agb", "/terms"],
      ["/datenschutz", "/privacy"],
      ["/impressum", "/legal"],
      ["/kontakt", "/contact"],
      ["/ueber-uns", "/about"],
      ["/zahlung", "/payment"],
    ];
    return [
      ...moved.map(([source, destination]) => ({ source, destination, permanent: true })),
      { source: "/produkt/:slug", destination: "/product/:slug", permanent: true },
      { source: "/bestellung/:id", destination: "/order/:id", permanent: true },
    ];
  },
  outputFileTracingIncludes: {
    "/*": ["./data/store.json"],
    "/api/*": ["./data/store.json"],
    "/product/*": ["./data/store.json"],
    "/order/*": ["./data/store.json"],
    "/checkout/*": ["./data/store.json"],
  },
};

export default nextConfig;
