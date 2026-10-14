"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { btnPrimary, btnSecondary } from "@/components/ui";
import { typeCopy } from "@/lib/copy";
import { formatEUR } from "@/lib/money";
import type { PublicProduct } from "@/lib/types";

export function ProductCard({ product, vatRate }: { product: PublicProduct; vatRate: number }) {
  const { add } = useCart();
  const [note, setNote] = useState("");
  const percent = Math.round(vatRate * 100);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-paper shadow-card">
      <Link href={`/produkt/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-cream">
        <Image
          src={product.images[0].src}
          alt={product.images[0].alt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover motion-safe:transition motion-safe:duration-700 motion-safe:hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-moss">{typeCopy(product.productType).label}</p>
        <h2 className="mt-2 text-xl font-medium tracking-tight">
          <Link href={`/produkt/${product.slug}`}>{product.name}</Link>
        </h2>
        <p className="mt-3 text-lg">{formatEUR(product.priceCents)}</p>
        <p className="text-sm text-muted">inkl. {percent} % MwSt., zzgl. Versand</p>
        <p className="mt-2 text-sm">{product.available > 0 ? `${product.available} verfügbar` : "Nicht verfügbar"}</p>
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
