"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/components/cart-context";
import { PriceBreakdown } from "@/components/price-summary";
import { btnPrimary, btnSecondary } from "@/components/ui";
import { formatEUR, summarize } from "@/lib/money";
import type { Catalog } from "@/lib/types";

export function CartView({ catalog }: { catalog: Catalog }) {
  const { items, setQty, remove } = useCart();
  const lines = items
    .map((item) => {
      const product = catalog.products.find((entry) => entry.slug === item.slug);
      if (!product || product.available < 1) return null;
      return { qty: Math.min(item.qty, product.available), product };
    })
    .filter((line): line is NonNullable<typeof line> => Boolean(line));

  const summary = useMemo(
    () =>
      summarize(
        lines.map(({ qty, product }) => ({ unitGrossCents: product.priceCents, qty })),
        lines.length ? catalog.shipping.costCents : 0,
        catalog.vatRate,
      ),
    [catalog.shipping.costCents, catalog.vatRate, lines],
  );

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-lg">Ihr Warenkorb ist leer.</p>
        <Link href="/shop" className={`${btnPrimary} mt-6`}>
          Saunen entdecken
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1.4fr_0.8fr]">
      <ul className="space-y-4">
        {lines.map(({ qty, product }) => (
          <li key={product.slug} className="grid grid-cols-[7rem_1fr] gap-4 rounded-3xl bg-paper p-4 sm:grid-cols-[9rem_1fr]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              {product.images[0] ? (
                <Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="140px" className="object-cover" />
              ) : null}
            </div>
            <div>
              <h2 className="font-medium">
                <Link href={`/produkt/${product.slug}`}>{product.name}</Link>
              </h2>
              <p className="mt-1 text-sm text-muted">{formatEUR(product.priceCents)} inkl. MwSt.</p>
              <p className="text-sm text-muted">{product.available > 0 ? `${product.available} Stück auf Lager` : "Nicht verfügbar"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="text-sm" htmlFor={`qty-${product.slug}`}>
                  Menge
                </label>
                <input
                  id={`qty-${product.slug}`}
                  type="number"
                  min={1}
                  max={product.available}
                  value={qty}
                  onChange={(event) => setQty(product.slug, Number(event.target.value), product.available)}
                  className="w-20 rounded-2xl border border-ink/15 bg-white px-3 py-2"
                />
                <button type="button" className="text-sm underline underline-offset-4" onClick={() => remove(product.slug)}>
                  Entfernen
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-3xl bg-paper p-5">
        <h2 className="text-lg font-medium">Summe</h2>
        <div className="mt-4">
          <PriceBreakdown summary={summary} shippingLabel={catalog.shipping.label} vatRate={catalog.vatRate} />
        </div>
        <p className="mt-4 text-sm text-muted">
          {catalog.shipping.deliveryEstimateConfirmed
            ? `Lieferzeit: ${catalog.shipping.deliveryEstimateText}`
            : "Lieferzeit: noch nicht vom Lieferanten bestätigt."}
        </p>
        <Link href="/kasse" className={`${btnPrimary} mt-6 w-full`}>
          Zur Kasse
        </Link>
        <Link href="/shop" className={`${btnSecondary} mt-3 w-full`}>
          Weiter einkaufen
        </Link>
      </aside>
    </div>
  );
}
