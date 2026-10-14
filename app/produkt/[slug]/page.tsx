import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/buy-box";
import { FaqList } from "@/components/faq-list";
import { Gallery } from "@/components/gallery";
import { ProductCard } from "@/components/product-card";
import { getCatalog, relatedProducts } from "@/lib/catalog";
import { specStatusLabel, typeCopy } from "@/lib/copy";
import { formatEUR } from "@/lib/money";
import { siteUrl } from "@/lib/site";
import type { SpecStatus } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product) return { title: "Modell" };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { images: [product.images[0].src] },
  };
}

function badge(status: SpecStatus): string {
  if (status === "verified") return "bg-forest/10 text-forest";
  if (status === "illustrative") return "bg-[#f3e6d4] text-ink";
  return "bg-ink/5 text-muted";
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product) notFound();
  const kind = typeCopy(product.productType);
  const percent = Math.round(catalog.vatRate * 100);
  const related = relatedProducts(catalog, product.slug);
  const faqs = [
    { q: "Welche Produktart ist das?", a: kind.explanation },
    {
      q: "Wie viele Stück sind verfügbar?",
      a: `Im Shop sind ${product.stock} Stück hinterlegt, davon ${product.available} jetzt auswählbar. Das ist kein Live-Bestand eines externen Lagersystems.`,
    },
    {
      q: "Was kostet der Versand?",
      a: `Aktuell ${formatEUR(catalog.shipping.costCents)} für „${catalog.shipping.label}“. Der Betrag steht im Warenkorb und an der Kasse, bevor Sie etwas absenden.`,
    },
    {
      q: "Wie sind Widerruf und Rückgabe geregelt?",
      a: "Die Einzelheiten stehen in der Widerrufsbelehrung. Bei einer Kabine als Sperrgut können die Rücksendekosten erheblich sein.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: product.images.map((image) => `${siteUrl()}${image.src}`),
    description: product.shortDescription,
    brand: { "@type": "Brand", name: "Badezimmer" },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.available > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl()}/produkt/${product.slug}`,
    },
  };

  return (
    <article className="mx-auto max-w-6xl px-5 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-sm text-muted">
        <Link href="/shop" className="underline underline-offset-4">
          Shop
        </Link>{" "}
        / {product.name}
      </p>
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-2">
        <Gallery images={product.images} />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-moss">{kind.label}</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight">{product.name}</h1>
          <p className="mt-2 text-sm text-muted">Modell {product.sku}</p>
          <p className="mt-5 text-3xl">{formatEUR(product.priceCents)}</p>
          <p className="text-sm text-muted">
            inkl. {percent} % MwSt., zzgl. Versand {formatEUR(catalog.shipping.costCents)}
          </p>
          <p className="mt-4 leading-relaxed">{product.shortDescription}</p>
          <BuyBox slug={product.slug} available={product.available} />
          <div className="mt-5 rounded-3xl border border-ink/10 p-4 text-sm leading-relaxed">
            <p className="font-medium">{kind.label}</p>
            <p className="mt-2 text-muted">{kind.explanation}</p>
          </div>
          <p className="mt-4 text-sm">
            <Link href="/widerruf" className="underline underline-offset-4">
              Rückgabe und Widerruf
            </Link>
          </p>
        </div>
      </div>

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-medium">Beschreibung</h2>
          <div className="mt-4 space-y-4 leading-relaxed text-muted">
            {product.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-4 text-sm">Gedacht für: {product.targetUse}</p>
          <h3 className="mt-8 text-lg font-medium">Gestaltungsmerkmale</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-medium">Angaben</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Nur Zeilen mit dem Hinweis „Bestätigt“ sind feste Angaben. Alles andere ist offen oder eine unverbindliche Darstellung.
          </p>
          <dl className="mt-4 divide-y divide-ink/10">
            {product.specs.map((spec) => (
              <div key={spec.label} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <dt className="text-sm text-muted">{spec.label}</dt>
                  <dd className="mt-1">{spec.value}</dd>
                </div>
                <dd className={`h-fit rounded-full px-3 py-1 text-xs ${badge(spec.status)}`}>{specStatusLabel(spec.status)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-paper p-6">
          <h2 className="text-xl font-medium">Versand</h2>
          <dl className="mt-4 space-y-3 text-sm leading-relaxed">
            <div>
              <dt className="text-muted">Ziel</dt>
              <dd>{catalog.shipping.destination}</dd>
            </div>
            <div>
              <dt className="text-muted">Kosten</dt>
              <dd>
                {formatEUR(catalog.shipping.costCents)} · {catalog.shipping.label}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Versandvorbereitung</dt>
              <dd>{catalog.shipping.dispatchText}</dd>
            </div>
            <div>
              <dt className="text-muted">Lieferzeit</dt>
              <dd>
                {catalog.shipping.deliveryEstimateConfirmed
                  ? catalog.shipping.deliveryEstimateText
                  : "Noch nicht vom Lieferanten bestätigt. Deshalb nennen wir keine Frist."}
              </dd>
            </div>
          </dl>
          <Link href="/versand" className="mt-4 inline-block text-sm underline underline-offset-4">
            Versand und Lieferung
          </Link>
        </div>
        <div className="rounded-3xl bg-paper p-6">
          <h2 className="text-xl font-medium">Montage und Anschluss</h2>
          <p className="mt-4 text-sm leading-relaxed">{catalog.installationText}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {catalog.shipping.assemblyIncluded
              ? "Nach aktueller Einstellung ist die Montage enthalten."
              : "Nach aktueller Einstellung ist die Montage nicht enthalten."}{" "}
            {catalog.shipping.assemblyText}
          </p>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-medium">Fragen zu diesem Modell</h2>
        <div className="mt-4">
          <FaqList items={faqs} />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-medium">Weitere Modelle</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} vatRate={catalog.vatRate} />
          ))}
        </div>
      </section>
    </article>
  );
}
