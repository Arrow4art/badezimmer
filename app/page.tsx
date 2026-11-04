import Link from "next/link";
import { CardFan } from "@/components/card-fan";
import { FaqList } from "@/components/faq-list";
import { HeroScene } from "@/components/hero-scene";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { ProductMarquee } from "@/components/product-marquee";
import { btnLight, btnPrimary } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { ShippingSteps } from "@/components/shipping-steps";
import { benefits, buildFaqs } from "@/lib/copy";

export default async function HomePage() {
  const catalog = await getCatalog();
  const faqs = buildFaqs(catalog.products, catalog.checkoutMode).slice(0, 5);

  return (
    <>
      <section className="relative min-h-[88vh] overflow-hidden text-cream">
        <HeroScene />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-5 pb-10 pt-24 lg:pt-28">
          <CardFan />
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-moss/40 bg-night/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-moss">
              <span className="h-1.5 w-1.5 rounded-full bg-moss shadow-[0_0_8px_#22d3ee]" aria-hidden="true" />
              Trading Card Games
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Booster displays, boxes and decks, <span className="text-holo">sealed.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/90">
              Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh! and Lorcana. Prices in USD with free US shipping.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className={btnPrimary}>
                Shop the collection
              </Link>
              <Link href="/about" className={btnLight}>
                About Pilands Cards
              </Link>
            </div>
          </div>
        </div>
        <div className="relative pb-10">
          <ProductMarquee products={catalog.products} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-moss">Collection</p>
            <h2 className="mt-2 text-3xl font-medium tracking-tight">Our collection</h2>
          </div>
          <Link href="/shop" className="text-sm underline underline-offset-4">
            All products
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
          {catalog.products.slice(0, 6).map((product) => (
            <ProductCard key={product.slug} product={product} vatRate={catalog.vatRate} shippingCents={catalog.shipping.costCents} />
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-paper/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="border-l-2 border-moss/60 pl-5">
              <h2 className="text-xl font-medium">{benefit.title}</h2>
              <p className="mt-3 leading-relaxed text-muted">{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <ShippingSteps shipping={catalog.shipping} products={catalog.products} />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-3xl font-medium tracking-tight">Frequently asked questions</h2>
        <div className="mt-6">
          <FaqList items={faqs} />
        </div>
        <Link href="/faq" className="mt-6 inline-block text-sm underline underline-offset-4">
          All questions
        </Link>
      </section>

      <section className="bg-gradient-to-r from-forest via-[#4C1D95] to-neon/80 bg-[length:200%_100%] text-cream motion-safe:animate-gradient-pan">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-3xl font-medium tracking-tight">New products and news</h2>
          <p className="mt-3 max-w-xl text-cream/80">
            The newsletter is optional. We only email you if you check the box, and you can unsubscribe at any time.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
