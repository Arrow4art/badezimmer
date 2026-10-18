import Image from "next/image";
import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { btnLight, btnPrimary } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { benefits, buildFaqs, steps } from "@/lib/copy";

export default async function HomePage() {
  const catalog = await getCatalog();
  const faqs = buildFaqs(catalog.products).slice(0, 5);

  return (
    <>
      <section className="relative min-h-[88vh] text-cream">
        <Image
          src="/images/hero-wellness-oase.webp"
          alt="Helle Holz-Mini-Sauna mit warmem Innenlicht in einem ruhigen Wohnraum"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/10" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl items-end px-5 pb-16 pt-28">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cream/80">Mini-Saunen für zu Hause</p>
            <h1 className="mt-4 text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
              Deine persönliche Wellness-Oase für zu Hause.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/90">
              Entdecke kompakte Mini-Saunen, die Design, Komfort und Entspannung verbinden.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className={btnPrimary}>
                Saunen entdecken
              </Link>
              <Link href="/ueber-uns" className={btnLight}>
                Mehr über Badezimmer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-moss">Sortiment</p>
            <h2 className="mt-2 text-3xl font-medium tracking-tight">Sechs Mini-Saunen</h2>
          </div>
          <Link href="/shop" className="text-sm underline underline-offset-4">
            Alle Modelle
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {catalog.products.map((product) => (
            <ProductCard key={product.slug} product={product} vatRate={catalog.vatRate} />
          ))}
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title}>
              <h2 className="text-xl font-medium">{benefit.title}</h2>
              <p className="mt-3 leading-relaxed text-muted">{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-moss">So geht es weiter</p>
        <h2 className="mt-2 text-3xl font-medium tracking-tight">Vom Modell bis zur Aufstellung</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-3xl bg-paper p-6">
              <p className="text-sm text-moss">0{index + 1}</p>
              <h3 className="mt-3 text-xl font-medium">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16">
        <h2 className="text-3xl font-medium tracking-tight">Häufige Fragen</h2>
        <div className="mt-6">
          <FaqList items={faqs} />
        </div>
        <Link href="/faq" className="mt-6 inline-block text-sm underline underline-offset-4">
          Alle Fragen
        </Link>
      </section>

      <section className="bg-forest text-cream">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-3xl font-medium tracking-tight">Neuigkeiten zu den Mini-Saunen</h2>
          <p className="mt-3 max-w-xl text-cream/80">
            Der Newsletter ist freiwillig. Ohne gesetztes Häkchen passiert nichts, und ohne E-Mail-Anbieter verschicken wir keine Bestätigung.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
