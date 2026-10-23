import data from "@/data/specs.json";
import type { ProductType, PublicSpec, TechData, TechValue } from "@/lib/types";

const techData = data as TechData;

// Only supplier-verified values with a source document and date may reach
// customers, structured data or the Merchant Center feed.
function isPublishable(entry: TechValue | undefined): entry is TechValue & { value: string } {
  return Boolean(entry && entry.status === "verified" && entry.value && entry.source && entry.verifiedAt);
}

function heatingLabel(value: string): string {
  if (value === "infrarot") return "Infrarotkabine";
  if (value === "traditionell") return "Klassische Sauna mit Saunaofen";
  return value;
}

export function verifiedSpecs(sku: string): PublicSpec[] {
  const record = techData.products.find((entry) => entry.sku === sku);
  if (!record) return [];
  return techData.fields.flatMap((field) => {
    const entry = record.specs[field.key];
    if (!field.labelDe || !isPublishable(entry)) return [];
    const value = field.key === "heatingSystem" ? heatingLabel(entry.value) : entry.value;
    return [{ label: field.labelDe, value }];
  });
}

export function verifiedProductType(sku: string): ProductType | null {
  const entry = techData.products.find((record) => record.sku === sku)?.specs.heatingSystem;
  if (!isPublishable(entry)) return null;
  return entry.value === "infrarot" || entry.value === "traditionell" ? entry.value : null;
}
