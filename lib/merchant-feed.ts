import { productDescription } from "@/lib/copy";
import { normalizeGtin, productBrand } from "@/lib/product-ids";
import type { Catalog } from "@/lib/types";

const GOOGLE_PRODUCT_CATEGORY = "Toys & Games > Games > Card Games";

function clean(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/\s+/g, " ").trim();
}

function xml(value: string): string {
  return clean(value)
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
  if (!host) return configured || "https://www.iwoody.de";
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function buildGoogleFeed(catalog: Catalog, origin: string): string {
  const items = catalog.products
    .map((product) => {
      const description = clean(productDescription(product)).slice(0, 5000);
      const title = clean(product.name).slice(0, 150);
      const images = product.images
        .map((image) => (image.src.startsWith("http") ? image.src : `${origin}${image.src}`))
        .filter((src) => src.startsWith("http"));
      if (!title || !description || !product.sku || product.priceCents <= 0 || images.length === 0) return "";
      const brand = productBrand(product);
      const gtin = normalizeGtin(product.gtin);
      const lines = [
        tag("g:id", product.sku),
        tag("g:title", title),
        tag("g:description", description),
        tag("g:link", `${origin}/produkt/${product.slug}`),
        tag("g:image_link", images[0]),
        ...images.slice(1, 10).map((image) => tag("g:additional_image_link", image)),
        tag("g:availability", product.available > 0 ? "in_stock" : "out_of_stock"),
        tag("g:price", price(product.priceCents)),
        // Branded products have a manufacturer barcode, so never claim identifier_exists=false.
        // Without a known GTIN Google only reports it as missing.
        ...(brand ? [tag("g:brand", brand)] : []),
        ...(gtin ? [tag("g:gtin", gtin)] : []),
        tag("g:condition", "new"),
        tag("g:google_product_category", GOOGLE_PRODUCT_CATEGORY),
        tag("g:product_type", product.targetUse || "Sammelkarten"),
        ...product.features
          .map((feature) => clean(feature).slice(0, 150))
          .filter(Boolean)
          .slice(0, 10)
          .map((feature) => tag("g:product_highlight", feature)),
        "      <g:shipping>",
        `        <g:country>DE</g:country>`,
        `        <g:service>${xml(catalog.shipping.label)}</g:service>`,
        `        <g:price>${price(catalog.shipping.costCents)}</g:price>`,
        ...(catalog.shipping.deliveryEstimateConfirmed
          ? [
              "        <g:min_handling_time>0</g:min_handling_time>",
              "        <g:max_handling_time>0</g:max_handling_time>",
              "        <g:min_transit_time>0</g:min_transit_time>",
              "        <g:max_transit_time>3</g:max_transit_time>",
            ]
          : []),
        "      </g:shipping>",
      ];
      return `    <item>\n${lines.join("\n")}\n    </item>`;
    })
    .filter(Boolean)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Iwoody</title>
    <link>${xml(origin)}</link>
    <description>Versiegelte Displays, Boxen und Decks. Preise inklusive Mehrwertsteuer.</description>
${items}
  </channel>
</rss>
`;
}
