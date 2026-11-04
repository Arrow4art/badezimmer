import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/buy-box";
import { FaqList } from "@/components/faq-list";
import { Gallery } from "@/components/gallery";
import { ProductCard } from "@/components/product-card";
import { getCatalog, relatedProducts } from "@/lib/catalog";
import { productDescription } from "@/lib/copy";
import { formatPrice, formatShipping } from "@/lib/money";
import { normalizeGtin, productBrand } from "@/lib/product-ids";
import { siteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog();
  const product = catalog.products.find((entry) => entry.slug === slug);
  if (!product) return { title: "Product" };
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
  const related = relatedProducts(catalog, product);
  const faqs = [
    {
      q: "Is this product in stock?",
      a:
        product.available > 0
          ? "Yes, this product is in stock and ready to order."
          : "This product is currently unavailable.",
    },
    {
      q: "How much is shipping?",
      a:
        catalog.shipping.costCents === 0
          ? `Shipping within the United States is free ("${catalog.shipping.label}").`
          : `${formatPrice(catalog.shipping.costCents)} for "${catalog.shipping.label}". You see the amount in your cart and at checkout before you place your order.`,
    },
    {
      q: "How do returns work?",
      a: "You have 14 days to return your order, and return shipping is free with a prepaid label. The details are in our returns policy.",
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
      priceCurrency: "USD",
      price: (product.priceCents / 100).toFixed(2),
      availability: product.available > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl()}/product/${product.slug}`,
      acceptedPaymentMethod: "https://schema.org/CreditCard",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturnShippingFees",
        refundType: "https://schema.org/FullRefund",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: (catalog.shipping.costCents / 100).toFixed(2),
          currency: "USD",
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
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
          <p className="mt-2 text-sm text-muted">SKU {product.sku}</p>
          <p className="mt-5 text-3xl">{formatPrice(product.priceCents)}</p>
          <p className="text-sm text-muted">
            No sales tax at checkout,{" "}
            {catalog.shipping.costCents === 0 ? "free shipping" : `plus ${formatPrice(catalog.shipping.costCents)} shipping`}
          </p>
          <p className="mt-2 text-sm">
            Pay by card through Stripe.{" "}
            <Link href="/payment" className="underline underline-offset-4">
              Payment methods
            </Link>
          </p>
          <p className="mt-4 leading-relaxed">{product.shortDescription}</p>
          <BuyBox slug={product.slug} available={product.available} />
          <p className="mt-4 text-sm">
            <Link href="/returns" className="underline underline-offset-4">
              Returns
            </Link>
          </p>
        </div>
      </div>

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-medium">Description</h2>
          <div className="mt-4 space-y-4 leading-relaxed text-muted">
            {product.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-4 text-sm">Made for: {product.targetUse}</p>
          <h3 className="mt-8 text-lg font-medium">Features</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-medium">Product details</h2>
          <dl className="mt-4 divide-y divide-ink/10">
            <div className="py-3">
              <dt className="text-sm text-muted">SKU</dt>
              <dd className="mt-1">{product.sku}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-paper p-6">
          <h2 className="text-xl font-medium">Shipping</h2>
          <dl className="mt-4 space-y-3 text-sm leading-relaxed">
            <div>
              <dt className="text-muted">Destination</dt>
              <dd>{catalog.shipping.destination}</dd>
            </div>
            <div>
              <dt className="text-muted">Cost</dt>
              <dd>
                {formatShipping(catalog.shipping.costCents)} · {catalog.shipping.label}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Handling</dt>
              <dd>{catalog.shipping.dispatchText}</dd>
            </div>
            <div>
              <dt className="text-muted">Delivery</dt>
              <dd>{catalog.shipping.bulkyGoodsText}</dd>
            </div>
            <div>
              <dt className="text-muted">Delivery time</dt>
              <dd>
                {catalog.shipping.deliveryEstimateConfirmed
                  ? catalog.shipping.deliveryEstimateText
                  : "Not confirmed by our supplier yet, so we don't quote a timeframe."}
              </dd>
            </div>
          </dl>
          <Link href="/shipping" className="mt-4 inline-block text-sm underline underline-offset-4">
            Shipping and delivery
          </Link>
        </div>
        <div className="rounded-3xl bg-paper p-6">
          <h2 className="text-xl font-medium">Note</h2>
          <p className="mt-4 text-sm leading-relaxed">{catalog.installationText}</p>
          {catalog.shipping.assemblyText ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">{catalog.shipping.assemblyText}</p>
          ) : null}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-medium">Questions about this product</h2>
        <div className="mt-4">
          <FaqList items={faqs} />
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-medium">More products</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} vatRate={catalog.vatRate} shippingCents={catalog.shipping.costCents} />
          ))}
        </div>
      </section>
    </article>
  );
}
