import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const origin = "https://www.iwoody.de";
const root = resolve(import.meta.dirname, "..");
const catalog = JSON.parse(readFileSync(resolve(root, "data/store.json"), "utf8"));
const tech = JSON.parse(readFileSync(resolve(root, "data/specs.json"), "utf8"));

// Same publishing rule as lib/tech-specs.ts.
function publishable(entry) {
  return Boolean(entry && entry.status === "verified" && entry.value && entry.source && entry.verifiedAt);
}

const heating = {
  infrarot: {
    label: "Infrarot-Mini-Sauna",
    spec: "Infrarotkabine",
    explanation: "Diese Kabine wird mit Infrarotstrahlern beheizt. Sie ist keine klassische finnische Sauna mit Saunaofen und Aufguss.",
  },
  traditionell: {
    label: "Klassische Mini-Sauna",
    spec: "Klassische Sauna mit Saunaofen",
    explanation: "Diese Kabine ist eine klassische Sauna mit elektrischem Saunaofen und keine Infrarotkabine.",
  },
};

function verified(sku) {
  const record = tech.products.find((entry) => entry.sku === sku);
  if (!record) return { type: null, specs: [] };
  const typeEntry = record.specs.heatingSystem;
  const type = publishable(typeEntry) ? heating[typeEntry.value] ?? null : null;
  const specs = tech.fields.flatMap((field) => {
    const entry = record.specs[field.key];
    if (field.key === "internalReference" || !field.labelDe || !publishable(entry)) return [];
    const value = field.key === "heatingSystem" ? heating[entry.value]?.spec ?? entry.value : entry.value;
    return [{ label: field.labelDe, value }];
  });
  return { type, specs };
}

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
    const { type, specs } = verified(product.sku);
    const images = product.images.map((image) => `${origin}${image.src}`);
    const description = [product.shortDescription, ...product.description, type?.explanation].filter(Boolean).join(" ");
    const lines = [
      tag("g:id", product.sku),
      tag("g:title", product.name),
      tag("g:description", description),
      tag("g:link", `${origin}/produkt/${product.slug}`),
      tag("g:image_link", images[0]),
      ...images.slice(1).map((image) => tag("g:additional_image_link", image)),
      tag("g:availability", product.stock > 0 ? "in_stock" : "out_of_stock"),
      tag("g:quantity", String(product.stock)),
      tag("g:price", price(product.priceCents)),
      tag("g:brand", "Badezimmer"),
      tag("g:identifier_exists", "false"),
      tag("g:condition", "new"),
      tag("g:google_product_category", "3992"),
      tag("g:product_type", type?.label ?? "Mini-Sauna"),
      ...product.features.map((feature) => tag("g:product_highlight", feature)),
      ...specs.map(
        (spec) =>
          `      <g:product_detail><g:section_name>Technische Daten</g:section_name><g:attribute_name>${xml(spec.label)}</g:attribute_name><g:attribute_value>${xml(spec.value)}</g:attribute_value></g:product_detail>`,
      ),
      "      <g:shipping>",
      "        <g:country>DE</g:country>",
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
