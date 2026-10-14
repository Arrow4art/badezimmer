"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { fieldClass } from "@/components/ui";
import type { PublicProduct } from "@/lib/types";

type PriceFilter = "all" | "under-1000" | "mid" | "over-1400";
type SortKey = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export function ShopBrowser({ products, vatRate }: { products: PublicProduct[]; vatRate: number }) {
  const [price, setPrice] = useState<PriceFilter>("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<SortKey>("name-asc");

  const types = Array.from(new Set(products.map((product) => product.productType)));

  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      const euros = product.priceCents / 100;
      const priceOk =
        price === "all" ||
        (price === "under-1000" && euros <= 1000) ||
        (price === "mid" && euros > 1000 && euros <= 1400) ||
        (price === "over-1400" && euros > 1400);
      const typeOk = type === "all" || product.productType === type;
      return priceOk && typeOk;
    });
    return filtered.sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name, "de");
      if (sort === "name-desc") return b.name.localeCompare(a.name, "de");
      if (sort === "price-asc") return a.priceCents - b.priceCents;
      return b.priceCents - a.priceCents;
    });
  }, [products, price, sort, type]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <form className="grid gap-3 rounded-3xl bg-paper p-4 sm:grid-cols-3" aria-label="Produkte filtern">
        <label className="text-sm">
          Preis
          <select className={fieldClass} value={price} onChange={(event) => setPrice(event.target.value as PriceFilter)}>
            <option value="all">Alle Preise</option>
            <option value="under-1000">Bis 1.000 €</option>
            <option value="mid">1.000 € bis 1.400 €</option>
            <option value="over-1400">Über 1.400 €</option>
          </select>
        </label>
        <label className="text-sm">
          Produktart
          <select className={fieldClass} value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">Alle Produktarten</option>
            {types.map((entry) => (
              <option key={entry} value={entry}>
                {entry === "infrarot" ? "Infrarot-Mini-Sauna" : "Klassische Mini-Sauna"}
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
      <p className="mt-6 text-sm text-muted">{visible.length} von 4 Modellen</p>
      {visible.length === 0 ? (
        <p className="mt-8 rounded-3xl bg-paper p-8 text-muted">Keine Mini-Sauna passt zu diesem Filter.</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={product} vatRate={vatRate} />
          ))}
        </div>
      )}
    </div>
  );
}
