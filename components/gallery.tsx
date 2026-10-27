"use client";

import { useState } from "react";
import { ProductPhoto } from "@/components/product-photo";
import type { ProductImage } from "@/lib/types";

export function Gallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const image = images[active] ?? images[0];
  if (!image) {
    return <div className="aspect-[4/3] rounded-3xl bg-paper" />;
  }

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-paper">
        <ProductPhoto image={image} priority sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((item, index) => (
            <button
              key={item.src}
              type="button"
              aria-label={`Bild ${index + 1} anzeigen`}
              className={`relative aspect-[4/3] overflow-hidden rounded-2xl ${index === active ? "ring-2 ring-forest" : "ring-1 ring-ink/10"}`}
              onClick={() => setActive(index)}
            >
              <ProductPhoto image={{ ...item, alt: "" }} sizes="20vw" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
