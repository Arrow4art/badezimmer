import { productDescription, typeCopy } from "@/lib/copy";
import type { Catalog } from "@/lib/types";

const GOOGLE_PRODUCT_CATEGORY = "3992";

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function price(cents: number): string {
  return `${(cents / 100).toFixed(2)} EUR`;
}

function tag(name: string, value: string): string {
  return `      <${name}>${xml(value)}</${name}>`;
}

export function feedOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured && !/localhost|127\.0\.0\.1/.test(configured)) return configured;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return configured || "https://badezimmer.vercel.app";
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function buildGoogleFeed(catalog: Catalog, origin: string): string {
  const items = catalog.products
    .map((product) => {
      const kind = typeCopy(product.productType);
      const description = [productDescription(product), kind.explanation].filter(Boolean).join(" ");
      const images = product.images.map((image) => `${origin}${image.src}`);
      const lines = [
        tag("g:id", product.sku),
        tag("g:title", product.name),
        tag("g:description", description),
        tag("g:link", `${origin}/produkt/${product.slug}`),
        tag("g:image_link", images[0]),
        ...images.slice(1).map((image) => tag("g:additional_image_link", image)),
        tag("g:availability", product.available > 0 ? "in_stock" : "out_of_stock"),
        tag("g:quantity", String(product.available)),
        tag("g:price", price(product.priceCents)),
        tag("g:brand", "Badezimmer"),
        tag("g:mpn", product.sku),
        tag("g:identifier_exists", "false"),
        tag("g:condition", "new"),
        tag("g:google_product_category", GOOGLE_PRODUCT_CATEGORY),
        tag("g:product_type", kind.label),
        ...product.features.map((feature) => tag("g:product_highlight", feature)),
        "      <g:shipping>",
        `        <g:country>DE</g:country>`,
        `        <g:service>${xml(catalog.shipping.label)}</g:service>`,
        `        <g:price>${price(catalog.shipping.costCents)}</g:price>`,
        ...(catalog.shipping.deliveryEstimateConfirmed
          ? [
              "        <g:min_handling_time>0</g:min_handling_time>",
              "        <g:max_handling_time>0</g:max_handling_time>",
              "        <g:min_transit_time>0</g:min_transit_time>",
              "        <g:max_transit_time>1</g:max_transit_time>",
            ]
          : []),
        "      </g:shipping>",
      ];
      return `    <item>\n${lines.join("\n")}\n    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Badezimmer</title>
    <link>${xml(origin)}</link>
    <description>Kompakte Mini-Saunen für zu Hause. Preise inklusive Mehrwertsteuer.</description>
${items}
  </channel>
</rss>
`;
}
