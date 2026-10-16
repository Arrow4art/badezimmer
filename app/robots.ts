import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const allow = process.env.ALLOW_INDEXING === "true";
  if (!allow) {
    return {
      rules: {
        userAgent: "*",
        allow: ["/feeds/google.xml", "/produkt/", "/shop", "/images/", "/google055d10e31ef05c2e.html"],
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
