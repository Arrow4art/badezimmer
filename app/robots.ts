import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const allow = process.env.ALLOW_INDEXING !== "false";
  if (!allow) {
    return {
      rules: {
        userAgent: "*",
        allow: ["/", "/feeds/google.xml", "/product/", "/shop", "/images/", "/google055d10e31ef05c2e.html"],
        disallow: ["/admin", "/checkout", "/cart", "/order", "/api/"],
      },
    };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/cart", "/order", "/api/"],
    },
  };
}
