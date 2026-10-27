import Link from "next/link";
import { Logo } from "@/components/logo";
import { TrustBadges } from "@/components/trust-badges";
import { legalNav, nav } from "@/lib/copy";
import { phoneHref } from "@/lib/site";
import type { BusinessInfo, ShippingConfig } from "@/lib/types";

export function Footer({
  business,
  checkoutMode,
  shipping,
  vatRate,
}: {
  business: BusinessInfo;
  checkoutMode: "stripe" | "inquiry";
  shipping: ShippingConfig;
  vatRate: number;
}) {
  const place = [business.street, [business.zip, business.city].filter(Boolean).join(" ")].filter(Boolean);
  return (
    <footer className="relative mt-20 border-t border-forest/40 bg-night/90 text-cream">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon to-transparent" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/75">
            Versiegelte Displays, Boxen und Decks. Preise in Euro, Lieferung innerhalb Deutschlands.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cream/50">Shop</p>
          <ul className="mt-3 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-cream/80 hover:text-cream">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cream/50">Rechtliches</p>
          <ul className="mt-3 space-y-2 text-sm">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-cream/80 hover:text-cream">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm leading-relaxed text-cream/75">
          <p className="text-xs uppercase tracking-[0.18em] text-cream/50">Kontakt</p>
          <p className="mt-3">Iwoody</p>
          {place.length > 0 ? <p className="mt-1">{place.join(", ")}</p> : null}
          {business.email ? (
            <a href={`mailto:${business.email}`} className="mt-1 block text-cream/80 hover:text-cream">
              {business.email}
            </a>
          ) : null}
          {business.phone ? (
            <a href={phoneHref(business.phone)} className="mt-1 block text-cream/80 hover:text-cream">
              {business.phone}
            </a>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <TrustBadges checkoutMode={checkoutMode} freeShipping={shipping.costCents === 0} />
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs leading-relaxed text-cream/55">
          Preise inklusive {Math.round(vatRate * 100)} % MwSt.{" "}
          {shipping.costCents === 0 ? "Kostenloser Versand" : "Versand"} innerhalb Deutschlands
          {shipping.deliveryEstimateConfirmed ? `. Lieferzeit: ${shipping.deliveryEstimateText}` : ""}.{" "}
          {checkoutMode === "stripe"
            ? "Zahlung per Karte über Stripe. Kartendaten werden in diesem Shop nicht gespeichert."
            : "Zahlung per Karte über Stripe, sobald das Konto verbunden ist."}
        </p>
      </div>
    </footer>
  );
}
