import Link from "next/link";
import { Logo } from "@/components/logo";
import { legalNav, nav } from "@/lib/copy";
import type { BusinessInfo } from "@/lib/types";

export function Footer({ business }: { business: BusinessInfo }) {
  const place = [business.street, [business.zip, business.city].filter(Boolean).join(" ")].filter(Boolean);
  return (
    <footer className="mt-20 bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/75">
            Kompakte Mini-Saunen für das eigene Zuhause. Preise in Euro, Lieferung innerhalb Deutschlands.
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
          <p className="mt-3">{business.legalName || "Badezimmer"}</p>
          {place.length > 0 ? <p className="mt-1">{place.join(", ")}</p> : null}
          {business.email ? (
            <a href={`mailto:${business.email}`} className="mt-1 block text-cream/80 hover:text-cream">
              {business.email}
            </a>
          ) : null}
          {business.phone ? <p>{business.phone}</p> : null}
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs leading-relaxed text-cream/55">
          Preise inklusive 19 % MwSt. Kostenloser Versand innerhalb Deutschlands. Kartendaten werden in diesem Shop nicht
          gespeichert.
        </p>
      </div>
    </footer>
  );
}
