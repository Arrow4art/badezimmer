"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { SearchField } from "@/components/search-field";
import { fieldClass } from "@/components/ui";
import type { PublicProduct } from "@/lib/types";

// Upper bounds in euros, chosen so each range holds a similar share of the catalog.
const priceRanges = {
  "under-50": { label: "Bis 50 €", min: 0, max: 50 },
  "50-100": { label: "50 € bis 100 €", min: 50, max: 100 },
  "100-200": { label: "100 € bis 200 €", min: 100, max: 200 },
  "over-200": { label: "Über 200 €", min: 200, max: Infinity },
} as const;

type PriceFilter = "all" | keyof typeof priceRanges;
type SortKey = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export function ShopBrowser({
  products,
  vatRate,
  shippingCents,
  initialQuery = "",
}: {
  products: PublicProduct[];
  vatRate: number;
  shippingCents: number;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [price, setPrice] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<SortKey>("name-asc");

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("de");
    const filtered = products.filter((product) => {
      const haystack = [product.name, product.sku, product.targetUse, product.shortDescription, ...product.features]
        .join(" ")
        .toLocaleLowerCase("de");
      const queryOk = !needle || haystack.includes(needle);
      const euros = product.priceCents / 100;
      const range = price === "all" ? null : priceRanges[price];
      const priceOk = !range || (euros > range.min && euros <= range.max);
      return queryOk && priceOk;
    });
    return filtered.sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "de");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "de");
      if (sort === "price-asc") return a.priceCents - b.priceCents;
      return b.priceCents - a.priceCents;
    });
  }, [products, price, query, sort]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <form
        className="grid gap-3 rounded-3xl bg-paper p-4 sm:grid-cols-2"
        aria-label="Produkte filtern"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="text-sm sm:col-span-2">
          <label htmlFor="shop-search">Suche</label>
          <SearchField
            items={products.map((product) => ({
              slug: product.slug,
              name: product.name,
              sku: product.sku,
              kind: product.targetUse,
              priceCents: product.priceCents,
            }))}
            id="shop-search"
            value={query}
            onChange={setQuery}
            placeholder="Name, Spiel oder Artikelnummer"
            inputClassName={fieldClass}
          />
        </div>
        <label className="text-sm">
          Preis
          <select className={fieldClass} value={price} onChange={(event) => setPrice(event.target.value as PriceFilter)}>
            <option value="all">Alle Preise</option>
            {Object.entries(priceRanges).map(([value, range]) => (
              <option key={value} value={value}>
                {range.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Sortierung
          <select className={fieldClass} value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="price-asc">Preis aufsteigend</option>
            <option value="price-desc">Preis absteigend</option>
          </select>
        </label>
      </form>
      <p className="mt-6 text-sm text-muted">{visible.length} von {products.length} Produkten</p>
      {visible.length === 0 ? (
        <p className="mt-8 rounded-3xl bg-paper p-8 text-muted">Kein Produkt passt zu diesem Filter.</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} vatRate={vatRate} shippingCents={shippingCents} />
          ))}
        </div>
      )}
    </div>
  );
}
