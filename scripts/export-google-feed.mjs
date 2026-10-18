import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const origin = "https://www.iwoody.de";
const root = resolve(import.meta.dirname, "..");
const catalog = JSON.parse(readFileSync(resolve(root, "data/store.json"), "utf8"));
const explanation =
  "Dieses Modell ist als Infrarot-Mini-Sauna eingeordnet. Es ist keine klassische finnische Sauna mit Saunaofen und Aufguss. Heiztechnik, Leistung und elektrischer Anschluss sind vom Lieferanten noch nicht bestätigt und deshalb nicht als geprüfte Technikdaten ausgewiesen.";

function xml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function price(cents) {
  return `${(cents / 100).toFixed(2)} EUR`;
}

function tag(name, value) {
  return `      <${name}>${xml(value)}</${name}>`;
}

const items = catalog.products
  .map((product) => {
    const images = product.images.map((image) => `${origin}${image.src}`);
    const lines = [
      tag("g:id", product.sku),
      tag("g:title", product.name),
      tag("g:description", [...product.description, explanation].join(" ")),
      tag("g:link", `${origin}/produkt/${product.slug}`),
      tag("g:image_link", images[0]),
      ...images.slice(1).map((image) => tag("g:additional_image_link", image)),
      tag("g:availability", product.stock > 0 ? "in_stock" : "out_of_stock"),
      tag("g:quantity", String(product.stock)),
      tag("g:price", price(product.priceCents)),
      tag("g:brand", "Badezimmer"),
      tag("g:mpn", product.sku),
      tag("g:condition", "new"),
      tag("g:google_product_category", "3992"),
      tag("g:product_type", "Infrarot-Mini-Sauna"),
      ...product.features.map((feature) => tag("g:product_highlight", feature)),
      "      <g:shipping>",
      "        <g:country>DE</g:country>",
      `        <g:service>${xml(catalog.shipping.label)}</g:service>`,
      `        <g:price>${price(catalog.shipping.costCents)}</g:price>`,
      "      </g:shipping>",
    ];
    return `    <item>\n${lines.join("\n")}\n    </item>`;
  })
  .join("\n");

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Badezimmer</title>
    <link>${xml(origin)}</link>
    <description>Kompakte Mini-Saunen für zu Hause. Preise inklusive Mehrwertsteuer.</description>
${items}
  </channel>
</rss>
`;

const out = resolve(root, "public/downloads/badezimmer-google-shopping.xml");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, feed);
console.log(`wrote ${catalog.products.length} products to ${out}`);
