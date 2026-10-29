"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { useCart } from "@/components/cart-context";
import { PriceBreakdown } from "@/components/price-summary";
import { btnPrimary, fieldClass } from "@/components/ui";
import { formatEUR, summarize } from "@/lib/money";
import type { Catalog } from "@/lib/types";

const empty = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  zip: "",
  city: "",
  deliveryNote: "",
};

type Payment = { id: string; clientSecret: string; stripe: Promise<Stripe | null> };

export function CheckoutForm({ catalog, publishableKey }: { catalog: Catalog; publishableKey: string | null }) {
  const { items } = useCart();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [customer, setCustomer] = useState(empty);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const lines = items
    .map((item) => {
      const product = catalog.products.find((entry) => entry.slug === item.slug);
      if (!product) return null;
      return { ...item, product, qty: Math.min(item.qty, product.available) };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null && line.qty > 0);

  const summary = useMemo(
    () =>
      summarize(
        lines.map((line) => ({ unitGrossCents: line.product.priceCents, qty: line.qty })),
        lines.length ? catalog.shipping.costCents : 0,
        catalog.vatRate,
      ),
    [catalog.shipping.costCents, catalog.vatRate, lines],
  );

  function update(key: keyof typeof empty, value: string) {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  }

  const overview = (
    <>
      <h2 className="text-lg font-medium">Ihre Auswahl</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {lines.map((line) => (
          <li key={line.product.slug} className="flex justify-between gap-4">
            <span>
              {line.qty} × {line.product.name}
            </span>
            <span>{formatEUR(line.product.priceCents * line.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <PriceBreakdown summary={summary} shippingLabel={catalog.shipping.label} vatRate={catalog.vatRate} />
      </div>
      <p className="mt-4 text-sm text-muted">
        {catalog.shipping.deliveryEstimateConfirmed
          ? `Lieferzeit: ${catalog.shipping.deliveryEstimateText}`
          : "Lieferzeit: noch nicht vom Lieferanten bestätigt."}
      </p>
    </>
  );

  // Stripe's payment form, embedded in this page once the order is saved. Card data goes straight to Stripe.
  if (payment) {
    return (
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="overflow-hidden rounded-3xl bg-white p-1 sm:p-3">
            <EmbeddedCheckoutProvider stripe={payment.stripe} options={{ clientSecret: payment.clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
          <Link
            href={`/kasse/abbruch?order=${encodeURIComponent(payment.id)}`}
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Zahlung abbrechen und Angaben ändern
          </Link>
        </div>
        <aside className="h-fit rounded-3xl bg-paper p-5">
          {overview}
          <p className="mt-3 text-sm leading-relaxed">
            Die Zahlung gilt erst, wenn Stripe sie als bezahlt bestätigt. Kartendaten gehen direkt an Stripe, nicht an
            diesen Shop.
          </p>
        </aside>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p>Ihr Warenkorb ist leer.</p>
        <Link href="/shop" className="mt-4 inline-block underline underline-offset-4">
          Zum Shop
        </Link>
      </div>
    );
  }

  return (
    <form
      className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: lines.map((line) => ({ slug: line.product.slug, qty: line.qty })),
            customer: { ...customer, country: "Deutschland" },
            acceptTerms,
            companyWebsite,
          }),
        });
        const data = (await response.json()) as {
          error?: string;
          url?: string;
          clientSecret?: string;
          id?: string;
          mode?: string;
        };
        if (!response.ok || !data.id) {
          setPending(false);
          setError(data.error || "Die Kasse konnte nicht abgeschlossen werden.");
          return;
        }
        if (data.mode === "stripe" && data.clientSecret && publishableKey) {
          setPayment({ id: data.id, clientSecret: data.clientSecret, stripe: loadStripe(publishableKey) });
          window.scrollTo({ top: 0 });
          return;
        }
        if (data.mode === "stripe" && data.url) {
          window.location.href = data.url;
          return;
        }
        window.location.href = `/bestellung/${data.id}`;
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Vorname
            <input className={fieldClass} required value={customer.firstName} onChange={(event) => update("firstName", event.target.value)} autoComplete="given-name" />
          </label>
          <label className="text-sm">
            Nachname
            <input className={fieldClass} required value={customer.lastName} onChange={(event) => update("lastName", event.target.value)} autoComplete="family-name" />
          </label>
        </div>
        <label className="block text-sm">
          E-Mail
          <input className={fieldClass} type="email" required value={customer.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" />
        </label>
        <label className="block text-sm">
          Telefon, optional
          <input
            className={fieldClass}
            value={customer.phone}
            onChange={(event) => update("phone", event.target.value)}
            autoComplete="tel"
          />
        </label>
        <label className="block text-sm">
          Straße und Hausnummer
          <input className={fieldClass} required value={customer.street} onChange={(event) => update("street", event.target.value)} autoComplete="street-address" />
        </label>
        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <label className="text-sm">
            PLZ
            <input className={fieldClass} required inputMode="numeric" pattern="[0-9]{5}" value={customer.zip} onChange={(event) => update("zip", event.target.value)} autoComplete="postal-code" />
          </label>
          <label className="text-sm">
            Ort
            <input className={fieldClass} required value={customer.city} onChange={(event) => update("city", event.target.value)} autoComplete="address-level2" />
          </label>
        </div>
        <label className="block text-sm">
          Land
          <input className={fieldClass} value="Deutschland" readOnly />
        </label>
        <label className="block text-sm">
          Hinweise zur Anlieferung
          <textarea className={fieldClass} rows={3} value={customer.deliveryNote} onChange={(event) => update("deliveryNote", event.target.value)} placeholder="Klingel, Paketstation, Hinweis" />
        </label>
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} className="mt-1" required />
          <span>
            Ich habe die <Link href="/agb" className="underline underline-offset-4">AGB</Link> und die{" "}
            <Link href="/widerruf" className="underline underline-offset-4">Widerrufsbelehrung</Link> gelesen.
          </span>
        </label>
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <label>
            Website
            <input value={companyWebsite} onChange={(event) => setCompanyWebsite(event.target.value)} tabIndex={-1} />
          </label>
        </div>
      </div>
      <aside className="h-fit rounded-3xl bg-paper p-5">
        {overview}
        <p className="mt-3 text-sm leading-relaxed">
          {catalog.checkoutMode === "stripe"
            ? publishableKey
              ? "Danach erscheint hier das Zahlungsformular von Stripe. Kartendaten gehen direkt an Stripe, nicht an diesen Shop. Nachnahme gibt es nicht."
              : "Weiter geht es zu Stripe. Die Zahlung gilt erst, wenn Stripe sie als bezahlt bestätigt. Kartendaten geben Sie nur dort ein, nicht in diesem Shop. Nachnahme gibt es nicht."
            : "Kartenzahlung über Stripe ist noch nicht freigeschaltet. Nachnahme gibt es nicht. Es wird nichts abgebucht."}
        </p>
        {error ? <p className="mt-3 text-sm text-oak">{error}</p> : null}
        <button className={`${btnPrimary} mt-5 w-full`} type="submit" disabled={pending || catalog.checkoutMode !== "stripe"}>
          {pending ? "Bitte warten …" : "Weiter zur sicheren Zahlung"}
        </button>
      </aside>
    </form>
  );
}
