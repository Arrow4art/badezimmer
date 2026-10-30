"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { btnPrimary, btnSecondary } from "@/components/ui";

export function BuyBox({ slug, available }: { slug: string; available: number }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const max = Math.max(available, 0);

  return (
    <div className="mt-6 rounded-3xl bg-paper p-5">
      <p className="text-sm">
        {max > 0 ? "Auf Lager" : "Nicht verfügbar"}
      </p>
      <div className="mt-4 flex items-center gap-3">
        <label htmlFor="menge" className="text-sm">
          Menge
        </label>
        <input
          id="menge"
          type="number"
          min={1}
          max={Math.max(max, 1)}
          value={max === 0 ? 0 : qty}
          disabled={max === 0}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isInteger(next)) return;
            setQty(Math.min(max, Math.max(1, next)));
          }}
          className="w-20 rounded-2xl border border-ink/15 bg-panel px-3 py-2"
        />
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className={btnPrimary}
          disabled={max < 1}
          onClick={() => {
            const ok = add(slug, qty, max);
            setNote(ok ? "In den Warenkorb gelegt." : "Diese Menge ist nicht vorrätig.");
          }}
        >
          In den Warenkorb
        </button>
        <Link href="/warenkorb" className={btnSecondary}>
          Zum Warenkorb
        </Link>
      </div>
      {note ? (
        <p className="mt-3 text-sm text-moss" role="status">
          {note}
        </p>
      ) : null}
    </div>
  );
}
