// Payment logos and security badges for the footer. Every badge states something that is
// true for this shop: HTTPS with HSTS, card payment on Stripe's page (no card data stored
// here), sealed goods, the 14-day withdrawal right and free shipping within Germany.
// Only the card brands the checkout promises ("Zahlung per Karte über Stripe") are shown.

function VisaLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-full w-full" role="img" aria-label="Visa">
      <rect width="48" height="32" rx="5" fill="#fff" />
      <text
        x="24"
        y="21"
        textAnchor="middle"
        fontFamily="Arial Black, Arial, sans-serif"
        fontSize="13"
        fontStyle="italic"
        fontWeight="900"
        fill="#1a1f71"
        letterSpacing="0.5"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-full w-full" role="img" aria-label="Mastercard">
      <rect width="48" height="32" rx="5" fill="#fff" />
      <circle cx="19.5" cy="16" r="9" fill="#eb001b" />
      <circle cx="28.5" cy="16" r="9" fill="#f79e1b" />
      <path d="M24 8.2a9 9 0 0 1 0 15.6 9 9 0 0 1 0-15.6Z" fill="#ff5f00" />
    </svg>
  );
}

function StripeLogo() {
  return (
    <svg viewBox="0 0 48 32" className="h-full w-full" role="img" aria-label="Stripe">
      <rect width="48" height="32" rx="5" fill="#fff" />
      <text x="24" y="20.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="700" fill="#635bff">
        stripe
      </text>
    </svg>
  );
}

const icons = {
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z M12 15v2",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5",
  box: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
  back: "M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3",
  truck: "M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
} as const;

function Badge({ icon, title, text }: { icon: keyof typeof icons; title: string; text: string }) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-moss/25 bg-panel/60 p-3">
      <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-moss" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={icons[icon]} />
      </svg>
      <span>
        <span className="block text-sm font-medium text-cream">{title}</span>
        <span className="block text-xs leading-snug text-cream/60">{text}</span>
      </span>
    </li>
  );
}

export function TrustBadges({ checkoutMode, freeShipping }: { checkoutMode: "stripe" | "inquiry"; freeShipping: boolean }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Badge icon="lock" title="SSL-verschlüsselt" text="Die gesamte Seite läuft über eine verschlüsselte HTTPS-Verbindung." />
        <Badge icon="shield" title="Sichere Zahlung" text="Sie zahlen auf der Seite von Stripe. Kartendaten speichern wir nicht." />
        <Badge icon="box" title="Originalverpackt" text="Displays, Boxen und Decks kommen versiegelt." />
        <Badge
          icon={freeShipping ? "truck" : "back"}
          title={freeShipping ? "Gratis Versand & 14 Tage Widerruf" : "14 Tage Widerruf"}
          text={freeShipping ? "Kostenlose Lieferung innerhalb Deutschlands, Rückgabe binnen 14 Tagen." : "Rückgabe binnen 14 Tagen ohne Angabe von Gründen."}
        />
      </ul>
      {checkoutMode === "stripe" ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="text-xs uppercase tracking-[0.18em] text-cream/50">Sicher bezahlen mit</p>
          <ul className="flex items-center gap-2">
            <li className="h-8 w-12">
              <VisaLogo />
            </li>
            <li className="h-8 w-12">
              <MastercardLogo />
            </li>
            <li className="h-8 w-12">
              <StripeLogo />
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
