import type { Product } from "@/lib/types";

// The brand printed on the box, matched by how the product name starts.
// A product's own `brand` in data/store.json wins over this list.
const brandByNamePrefix: Array<[RegExp, string]> = [
  [/^EVORETRO\b/i, "EVORETRO"],
  [/^Pokémon\b/i, "Pokémon"],
  [/^Magic: The Gathering\b/i, "Wizards of the Coast"],
  [/^One Piece\b/i, "Bandai"],
  [/^Yu-Gi-Oh!/i, "Konami"],
  [/^(Disney )?Lorcana\b/i, "Ravensburger"],
];

export function productBrand(product: Pick<Product, "name" | "brand">): string | undefined {
  if (product.brand?.trim()) return product.brand.trim();
  return brandByNamePrefix.find(([pattern]) => pattern.test(product.name))?.[1];
}

/**
 * Returns the GTIN (EAN-8, UPC-A, EAN-13 or GTIN-14) as plain digits when its check digit is
 * correct, or null. Spaces and dashes, as printed under barcodes, are ignored.
 */
export function normalizeGtin(value: string | undefined): string | null {
  const digits = (value ?? "").replace(/[\s-]/g, "");
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(digits)) return null;
  if (/^0+$/.test(digits)) return null;
  const body = digits.slice(0, -1);
  let sum = 0;
  for (let index = 0; index < body.length; index += 1) {
    const digit = Number(body[body.length - 1 - index]);
    sum += index % 2 === 0 ? digit * 3 : digit;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[digits.length - 1]) ? digits : null;
}
