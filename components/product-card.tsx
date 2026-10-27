"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { btnPrimary, btnSecondary } from "@/components/ui";
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
            sizes="(min-width: 1024px) 30vw, 50vw"
            className="object-cover motion-safe:transition motion-safe:duration-700 motion-safe:hover:scale-105"
          />
        ) : null}
      </Link>
      {/* Two cards share a phone screen, so text and padding shrink below sm. */}
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <p className="text-[0.65rem] uppercase tracking-[0.16em] text-moss sm:text-xs">
          {product.targetUse}
        </p>
        <h2 className="mt-1.5 text-sm font-medium leading-snug tracking-tight sm:mt-2 sm:text-xl">
          <Link href={`/produkt/${product.slug}`}>{product.name}</Link>
        </h2>
        <p className="mt-2 text-lg font-semibold text-gold sm:mt-3 sm:text-2xl">{formatEUR(product.priceCents)}</p>
        <p className="text-xs text-muted sm:text-sm">
          inkl. {percent} % MwSt., {shippingCents === 0 ? "kostenloser Versand" : "zzgl. Versand"}
        </p>
        <p className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
          <span
            className={`h-2 w-2 rounded-full ${product.available > 0 ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-muted"}`}
            aria-hidden="true"
          />
          {product.available > 0 ? `${product.available} Stück auf Lager` : "Nicht verfügbar"}
        </p>
        <div className="mt-auto flex flex-col gap-2 pt-4 sm:pt-5">
          {/* Image and title already link to the product, so phones keep only the cart button. */}
          <Link href={`/produkt/${product.slug}`} className={`${btnSecondary} max-sm:hidden`}>
            Produkt ansehen
          </Link>
          <button
            type="button"
            className={`${btnPrimary} max-sm:px-3 max-sm:py-2.5 max-sm:text-xs`}
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
