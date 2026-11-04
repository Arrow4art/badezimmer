import Link from "next/link";
import { Logo } from "@/components/logo";
import { TrustBadges } from "@/components/trust-badges";
import { legalNav, nav } from "@/lib/copy";
import { formatAddress, phoneHref } from "@/lib/site";
import type { BusinessInfo, ShippingConfig } from "@/lib/types";

export function Footer({
  business,
  checkoutMode,
  shipping,
}: {
  business: BusinessInfo;
  checkoutMode: "stripe" | "inquiry";
  shipping: ShippingConfig;
}) {
  const place = formatAddress(business);
  return (
    <footer className="relative mt-20 border-t border-forest/40 bg-night/90 text-cream">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon to-transparent" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/75">
            Sealed booster displays, boxes and decks. Prices in USD, shipping within the United States.
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
          <p className="text-xs uppercase tracking-[0.18em] text-cream/50">Legal</p>
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
          <p className="text-xs uppercase tracking-[0.18em] text-cream/50">Contact</p>
          <p className="mt-3">Pilands Cards</p>
          {place ? <p className="mt-1">{place}</p> : null}
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
          Prices in USD. No sales tax added at checkout.{" "}
          {shipping.costCents === 0 ? "Free shipping" : "Shipping"} within the United States
          {shipping.deliveryEstimateConfirmed ? `. Delivery: ${shipping.deliveryEstimateText}` : ""}.{" "}
          {checkoutMode === "stripe"
            ? "Pay by card through Stripe. Card details aren't stored in this shop."
            : "Card payment through Stripe once the account is connected."}
        </p>
      </div>
    </footer>
  );
}
