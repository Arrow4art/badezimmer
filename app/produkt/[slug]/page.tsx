import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/buy-box";
import { FaqList } from "@/components/faq-list";
import { Gallery } from "@/components/gallery";
import { ProductCard } from "@/components/product-card";
import { getCatalog, relatedProducts } from "@/lib/catalog";
import { productDescription } from "@/lib/copy";
import { formatEUR, formatShipping } from "@/lib/money";
import { normalizeGtin, productBrand } from "@/lib/product-ids";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product) return { title: "Produkt" };
  return {
    title: product.name,
    description: product.shortDescription,
    robots: { index: true, follow: true },
    ...(product.images[0] ? { openGraph: { images: [product.images[0].src] } } : {}),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product) notFound();
  const percent = Math.round(catalog.vatRate * 100);
  const related = relatedProducts(catalog, product.slug);
  const faqs = [
    {
      q: "Wie viele Stück sind verfügbar?",
      a:
        product.available > 0
          ? `Aktuell sind ${product.available} Stück verfügbar. Die Menge im Warenkorb ist auf diesen Bestand begrenzt.`
          : "Dieses Produkt ist derzeit nicht verfügbar.",
    },
    {
      q: "Was kostet der Versand?",
      a:
        catalog.shipping.costCents === 0
          ? `Der Versand innerhalb Deutschlands ist kostenlos („${catalog.shipping.label}“).`
          : `${formatEUR(catalog.shipping.costCents)} für „${catalog.shipping.label}“. Der Betrag steht im Warenkorb und an der Kasse, bevor Sie etwas absenden.`,
    },
    {
      q: "Wie sind Widerruf und Rückgabe geregelt?",
      a: "Die Einzelheiten stehen in der Widerrufsbelehrung.",
    },
  ];

  const brand = productBrand(product);
  const gtin = normalizeGtin(product.gtin);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: product.images.map((image) =>
      image.src.startsWith("http") ? image.src : `${siteUrl()}${image.src}`,
    ),
    description: productDescription(product),
    ...(brand ? { brand: { "@type": "Brand", name: brand } } : {}),
    ...(gtin ? { gtin } : {}),
    offers: {
      "@type": "Offer",
      itemCondition: "https://schema.org/NewCondition",
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.available > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      inventoryLevel: { "@type": "QuantitativeValue", value: product.available },
      url: `${siteUrl()}/produkt/${product.slug}`,
      acceptedPaymentMethod: "https://schema.org/CreditCard",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "DE",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
        refundType: "https://schema.org/FullRefund",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (catalog.shipping.costCents / 100).toFixed(2),
          currency: "EUR",
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "DE" },
        ...(catalog.shipping.deliveryEstimateConfirmed
          ? {
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
                transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 3, unitCode: "DAY" },
              },
            }
          : {}),
      },
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
        <div>
          <Gallery images={product.images} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-moss">{product.targetUse}</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight">{product.name}</h1>
          <p className="mt-2 text-sm text-muted">Artikelnummer {product.sku}</p>
          <p className="mt-5 text-3xl">{formatEUR(product.priceCents)}</p>
          <p className="text-sm text-muted">
            inkl. {percent} % MwSt.,{" "}
            {catalog.shipping.costCents === 0 ? "kostenloser Versand" : `zzgl. Versand ${formatEUR(catalog.shipping.costCents)}`}
          </p>
          <p className="mt-2 text-sm">
            Zahlung per Karte über Stripe.{" "}
            <Link href="/zahlung" className="underline underline-offset-4">
              Zahlungsarten
            </Link>
          </p>
          <p className="mt-4 leading-relaxed">{product.shortDescription}</p>
          <BuyBox slug={product.slug} available={product.available} />
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
          <h3 className="mt-8 text-lg font-medium">Merkmale</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-medium">Artikeldaten</h2>
          <dl className="mt-4 divide-y divide-ink/10">
            <div className="py-3">
              <dt className="text-sm text-muted">Artikelnummer</dt>
              <dd className="mt-1">{product.sku}</dd>
            </div>
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
                {formatShipping(catalog.shipping.costCents)} · {catalog.shipping.label}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Versandvorbereitung</dt>
              <dd>{catalog.shipping.dispatchText}</dd>
            </div>
            <div>
              <dt className="text-muted">Lieferung</dt>
              <dd>{catalog.shipping.bulkyGoodsText}</dd>
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
          <h2 className="text-xl font-medium">Hinweis</h2>
          <p className="mt-4 text-sm leading-relaxed">{catalog.installationText}</p>
          {catalog.shipping.assemblyText ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">{catalog.shipping.assemblyText}</p>
          ) : null}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-medium">Fragen zu diesem Produkt</h2>
        <div className="mt-4">
          <FaqList items={faqs} />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-medium">Weitere Produkte</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} vatRate={catalog.vatRate} shippingCents={catalog.shipping.costCents} />
          ))}
        </div>
      </section>
    </article>
  );
}
