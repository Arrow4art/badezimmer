"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { btnPrimary, btnSecondary } from "@/components/ui";
import { typeCopy } from "@/lib/copy";
import { formatEUR } from "@/lib/money";
import type { PublicProduct } from "@/lib/types";

export function ProductCard({
  product,
  vatRate,
  shippingCents,
}: {
  product: PublicProduct;
  vatRate: number;
  shippingCents: number;
}) {
  const { add } = useCart();
  const [note, setNote] = useState("");
  const percent = Math.round(vatRate * 100);

  return (
    <article className="holo-card flex h-full flex-col overflow-hidden rounded-3xl bg-paper/90 shadow-card">
      <Link href={`/produkt/${product.slug}`} className="holo-shine relative block aspect-[4/3] overflow-hidden bg-night">
        {product.images[0] ? (
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover motion-safe:transition motion-safe:duration-700 motion-safe:hover:scale-105"
          />
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-moss">
          {product.productType ? typeCopy(product.productType).label : product.targetUse}
        </p>
        <h2 className="mt-2 text-xl font-medium tracking-tight">
          <Link href={`/produkt/${product.slug}`}>{product.name}</Link>
        </h2>
        <p className="mt-3 text-2xl font-semibold text-gold">{formatEUR(product.priceCents)}</p>
        <p className="text-sm text-muted">
          inkl. {percent} % MwSt., {shippingCents === 0 ? "kostenloser Versand" : "zzgl. Versand"}
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm">
          <span
            className={`h-2 w-2 rounded-full ${product.available > 0 ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-muted"}`}
            aria-hidden="true"
          />
          {product.available > 0 ? `${product.available} Stück auf Lager` : "Nicht verfügbar"}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href={`/produkt/${product.slug}`} className={btnSecondary}>
            Produkt ansehen
          </Link>
          <button
            type="button"
            className={btnPrimary}
            disabled={product.available < 1}
            onClick={() => {
              const ok = add(product.slug, 1, product.available);
              setNote(ok ? "In den Warenkorb gelegt." : "Nicht mehr genug verfügbar.");
            }}
          >
            In den Warenkorb
          </button>
        </div>
        {note ? <p className="mt-3 text-sm text-moss" role="status">{note}</p> : null}
      </div>
    </article>
  );
}
