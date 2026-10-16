import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const allow = process.env.ALLOW_INDEXING === "true";
  if (!allow) {
    return {
      rules: {
        userAgent: "*",
        allow: ["/feeds/google.xml", "/produkt/", "/shop", "/images/"],
        disallow: "/",
      },
    };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/kasse", "/warenkorb", "/bestellung", "/api/"],
    },
  };
}
