import Link from "next/link";
import { ProductPhoto } from "@/components/product-photo";
import { formatEUR } from "@/lib/money";
import { productBrand } from "@/lib/product-ids";
import type { PublicProduct } from "@/lib/types";

/** Takes products from each game in turn, so the strip mixes Pokémon, Magic, Lorcana and the rest. */
function mixGames(products: PublicProduct[], limit: number): PublicProduct[] {
  const byGame = new Map<string, PublicProduct[]>();
  for (const product of products) {
    if (!product.images[0] || product.available < 1) continue;
    const game = productBrand(product) ?? "";
    byGame.set(game, [...(byGame.get(game) ?? []), product]);
  }
  const queues = [...byGame.values()];
  const mixed: PublicProduct[] = [];
  while (mixed.length < limit && queues.some((queue) => queue.length)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next && mixed.length < limit) mixed.push(next);
    }
  }
  return mixed;
}

// The list is rendered twice and the track slides by half its width, so the loop has no seam.
// The CSS lives in globals.css (.marquee); under reduced motion the strip becomes swipeable.
export function ProductMarquee({ products }: { products: PublicProduct[] }) {
  const items = mixGames(products, 16);
  if (items.length < 4) return null;

  return (
    <div className="marquee relative" role="region" aria-label="Produkte aus dem Sortiment">
      <ul className="marquee-track">
        {[0, 1].map((copy) =>
          items.map((product) => (
            <li key={`${copy}-${product.slug}`} className="pr-3 sm:pr-4" aria-hidden={copy === 1 || undefined}>
              <Link
                href={`/produkt/${product.slug}`}
                tabIndex={copy === 1 ? -1 : undefined}
                className="group flex w-56 items-center gap-3 rounded-2xl border border-ink/10 bg-panel/70 p-2 pr-4 backdrop-blur-sm transition hover:border-moss/60 hover:shadow-[0_0_24px_-8px_rgba(34,211,238,0.8)] sm:w-64"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-night sm:h-16 sm:w-16">
                  <ProductPhoto image={product.images[0]} sizes="64px" />
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-xs font-medium leading-snug text-cream sm:text-sm">{product.name}</span>
                  <span className="mt-1 block text-sm font-semibold text-gold">{formatEUR(product.priceCents)}</span>
                </span>
              </Link>
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
