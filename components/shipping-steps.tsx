import Link from "next/link";
import { ProductPhoto } from "@/components/product-photo";
import type { PublicProduct, ShippingConfig } from "@/lib/types";

// The three steps from payment to the door, next to a parcel with real products rising out of it.
// Every line comes from the shipping settings or the Widerruf page, so it stays true when those change.
export function ShippingSteps({ shipping, products }: { shipping: ShippingConfig; products: PublicProduct[] }) {
  const free = shipping.costCents === 0;
  const steps = [
    {
      title: "Bestellen und bezahlen",
      text: "Sobald Ihre Zahlung bestätigt ist, beginnen wir mit Ihrer Bestellung.",
    },
    {
      title: "Verpackt und versendet",
      text: "Originalverpackt und versiegelt, sicher als Paket. Die Sendungsreferenz kommt per E-Mail.",
    },
    {
      title: "Bei Ihnen zu Hause",
      text: shipping.deliveryEstimateConfirmed
        ? `In ${shipping.deliveryEstimateText}, direkt an Ihre Tür.`
        : "Als Paket direkt an Ihre Tür in Deutschland.",
    },
  ];
  const fan = products.filter((product) => product.images[0]).slice(0, 3);

  return (
    <section className="relative overflow-hidden border-y border-ink/10 bg-night">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_80%_45%,rgba(255,43,214,0.22),transparent_70%),radial-gradient(50%_60%_at_10%_10%,rgba(34,211,238,0.12),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-moss">Versand und Rückgabe</p>
          <h2 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            {free ? "Kostenloser Versand in " : "Versand in "}
            <span className="text-holo font-light italic">ganz</span> Deutschland
          </h2>

          <ol className="relative mt-10 space-y-8">
            <span className="absolute bottom-6 left-5 top-6 w-px bg-gradient-to-b from-moss/70 via-forest/70 to-neon/70" aria-hidden="true" />
            {steps.map((step, index) => (
              <li key={step.title} className="relative flex gap-5">
                <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-moss/60 bg-night text-sm font-semibold text-moss shadow-[0_0_16px_-4px_#22d3ee]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex gap-4 rounded-3xl border border-ink/10 bg-paper/80 p-5 backdrop-blur">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-panel text-moss" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3" />
              </svg>
            </span>
            <div>
              <h3 className="text-lg font-semibold">14 Tage Widerrufsrecht</h3>
              <p className="mt-1 leading-relaxed text-muted">
                Sie können jede Bestellung innerhalb von 14 Tagen nach Erhalt ohne Angabe von Gründen zurückgeben. Bei einem
                Mangel tragen wir die Kosten der Rücksendung.
              </p>
              <Link href="/widerruf" className="mt-3 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">
                Zur Widerrufsbelehrung <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        <Parcel products={fan} />
      </div>
    </section>
  );
}

function Parcel({ products }: { products: PublicProduct[] }) {
  // Left, middle and right card: sideways shift (in card widths), lift and tilt.
  const fan = [
    { x: -108, y: 6, deg: -14 },
    { x: -50, y: -6, deg: 0 },
    { x: 8, y: 6, deg: 14 },
  ];
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-lg" aria-hidden="true">
      <div className="absolute left-1/2 top-[12%] h-[60%] w-[70%] -translate-x-1/2 rounded-full bg-neon/30 blur-3xl" />
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-0 h-[70%] w-full">
        {/* Back wall and side flaps, behind the products. */}
        <polygon points="80,60 320,60 340,110 60,110" fill="#0d0a1f" />
        <polygon points="60,110 80,60 22,34 2,92" fill="#1D1740" stroke="#7C3AED" strokeWidth="1.5" />
        <polygon points="340,110 320,60 378,34 398,92" fill="#1D1740" stroke="#7C3AED" strokeWidth="1.5" />
      </svg>
      {products.map((product, index) => (
        <div
          key={product.slug}
          className="absolute left-1/2 top-[16%] aspect-[3/4] h-[54%] overflow-hidden rounded-2xl border border-ink/15 bg-paper shadow-glow"
          style={{
            transform: `translate(${fan[index].x}%, ${fan[index].y}%) rotate(${fan[index].deg}deg)`,
            zIndex: index === 1 ? 2 : 1,
          }}
        >
          <ProductPhoto image={product.images[0]} sizes="200px" />
        </div>
      ))}
      <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-0 z-10 h-[70%] w-full">
        <defs>
          <linearGradient id="parcel-edge" x1="0" x2="1">
            <stop offset="0" stopColor="#22D3EE" />
            <stop offset="0.5" stopColor="#A78BFA" />
            <stop offset="1" stopColor="#FF2BD6" />
          </linearGradient>
          <linearGradient id="parcel-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#241c4f" />
            <stop offset="1" stopColor="#141029" />
          </linearGradient>
        </defs>
        {/* Front face and the front flap folded out, in front of the products. */}
        <polygon points="60,110 340,110 324,254 76,254" fill="url(#parcel-face)" stroke="url(#parcel-edge)" strokeWidth="2" />
        <polygon points="60,110 340,110 372,138 28,138" fill="#2a2160" stroke="url(#parcel-edge)" strokeWidth="2" />
        <rect x="160" y="138" width="80" height="116" fill="#FF2BD6" opacity="0.18" />
        <text x="200" y="205" textAnchor="middle" fontFamily="inherit" fontSize="18" fontWeight="700" letterSpacing="4" fill="#F3F0FF" opacity="0.85">
          IWOODY
        </text>
      </svg>
    </div>
  );
}
