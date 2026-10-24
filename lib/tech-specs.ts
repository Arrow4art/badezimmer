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

const PENDING = "Noch nicht belegt. Diese Angabe wird erst veröffentlicht, wenn eine Herstellerunterlage vorliegt.";

const SHEET: { key: string; label: string }[] = [
  { key: "heatingSystem", label: "Produkttyp" },
  { key: "exteriorDimensions", label: "Abmessungen (B × T × H)" },
  { key: "netWeight", label: "Gewicht" },
  { key: "maxUsers", label: "Kapazität" },
  { key: "materials", label: "Holzart" },
  { key: "glass", label: "Glas" },
  { key: "heater", label: "Heizgerät" },
  { key: "heatingPower", label: "Leistung" },
];

export type SpecRow = { label: string; value: string; pending: boolean };

function statedMaterial(sku: string): string | null {
  if (sku === "BAD-KS-001" || sku === "BAD-NS-002") return "Helle Holzoptik";
  if (sku === "BAD-PR-003") return "Warme Holzoptik";
  if (sku === "BAD-EM-005") return "Eichenoptik";
  if (sku === "BAD-PM-004" || sku === "BAD-AP-006") return "Holzoptik";
  return null;
}

export function customerSpecRows(sku: string): SpecRow[] {
  const record = techData.products.find((entry) => entry.sku === sku);
  const rows: SpecRow[] = [{ label: "Modell", value: `${sku} (interne Artikelnummer)`, pending: false }];
  for (const field of SHEET) {
    const entry = record?.specs[field.key];
    if (isPublishable(entry)) {
      rows.push({
        label: field.label,
        value: field.key === "heatingSystem" ? heatingLabel(entry.value) : entry.value,
        pending: false,
      });
      continue;
    }
    if (field.key === "exteriorDimensions" && entry?.value) {
      rows.push({ label: field.label, value: entry.value, pending: false });
      continue;
    }
    if (field.key === "materials") {
      const material = statedMaterial(sku);
      if (material) {
        rows.push({ label: field.label, value: material, pending: false });
        continue;
      }
    }
    rows.push({ label: field.label, value: PENDING, pending: true });
  }
  const supplierSku = record?.specs.supplierSku;
  rows.push(
    isPublishable(supplierSku)
      ? { label: "Hersteller-Artikelnummer", value: supplierSku.value, pending: false }
      : {
          label: "Hersteller-Artikelnummer",
          value: `Keine Hersteller-Artikelnummer hinterlegt. Interne Artikelnummer: ${sku}.`,
          pending: true,
        },
  );
  return rows;
}

export function verifiedProductType(sku: string): ProductType | null {
  const entry = techData.products.find((record) => record.sku === sku)?.specs.heatingSystem;
  if (!isPublishable(entry)) return null;
  return entry.value === "infrarot" || entry.value === "traditionell" ? entry.value : null;
}
