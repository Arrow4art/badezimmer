"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { StripePayment } from "@/components/stripe-payment";
import { useCart } from "@/components/cart-context";
import { PriceBreakdown } from "@/components/price-summary";
import { btnPrimary, fieldClass } from "@/components/ui";
import { formatPrice, summarize } from "@/lib/money";
import type { Catalog } from "@/lib/types";
import { US_STATES } from "@/lib/us-states";

const empty = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  zip: "",
  city: "",
  state: "",
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
      <h2 className="text-lg font-medium">Your order</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {lines.map((line) => (
          <li key={line.product.slug} className="flex justify-between gap-4">
            <span>
              {line.qty} × {line.product.name}
            </span>
            <span>{formatPrice(line.product.priceCents * line.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <PriceBreakdown summary={summary} shippingLabel={catalog.shipping.label} vatRate={catalog.vatRate} currency="USD" />
      </div>
      <p className="mt-4 text-sm text-muted">
        {catalog.shipping.deliveryEstimateConfirmed
          ? `Delivery: ${catalog.shipping.deliveryEstimateText}`
          : "We email you tracking details as soon as your order ships."}
      </p>
    </>
  );

  // The payment form (Stripe Elements) inside this page once the order is saved. Card data goes straight to Stripe.
  if (payment) {
    return (
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="rounded-3xl bg-paper p-5">
            <h2 className="mb-4 text-lg font-medium">Payment</h2>
            <StripePayment
              stripe={payment.stripe}
              clientSecret={payment.clientSecret}
              orderId={payment.id}
              billingAddress={{
                name: `${customer.firstName} ${customer.lastName}`.trim(),
                address: { country: "US", line1: customer.street, postal_code: customer.zip, city: customer.city, state: customer.state },
              }}
              totalCents={summary.totalGrossCents}
            />
          </div>
          <Link
            href={`/checkout/cancel?order=${encodeURIComponent(payment.id)}`}
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Cancel payment and edit details
          </Link>
        </div>
        <aside className="h-fit rounded-3xl bg-paper p-5">
          {overview}
          <p className="mt-3 text-sm leading-relaxed">
            Your order is placed once Stripe confirms payment. Card details go directly to Stripe, not to this
            shop.
          </p>
        </aside>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p>Your cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-block underline underline-offset-4">
          Go to shop
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
            customer: { ...customer, country: "United States" },
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
          setError(data.error || "We couldn't complete checkout.");
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
        window.location.href = `/order/${data.id}`;
      }}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            First name
            <input className={fieldClass} required value={customer.firstName} onChange={(event) => update("firstName", event.target.value)} autoComplete="given-name" />
          </label>
          <label className="text-sm">
            Last name
            <input className={fieldClass} required value={customer.lastName} onChange={(event) => update("lastName", event.target.value)} autoComplete="family-name" />
          </label>
        </div>
        <label className="block text-sm">
          Email
          <input className={fieldClass} type="email" required value={customer.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" />
        </label>
        <label className="block text-sm">
          Phone (optional)
          <input
            className={fieldClass}
            value={customer.phone}
            onChange={(event) => update("phone", event.target.value)}
            autoComplete="tel"
          />
        </label>
        <label className="block text-sm">
          Street address
          <input className={fieldClass} required value={customer.street} onChange={(event) => update("street", event.target.value)} autoComplete="street-address" />
        </label>
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem_8rem]">
          <label className="text-sm">
            City
            <input className={fieldClass} required value={customer.city} onChange={(event) => update("city", event.target.value)} autoComplete="address-level2" />
          </label>
          <label className="text-sm">
            State
            <select className={fieldClass} required value={customer.state} onChange={(event) => update("state", event.target.value)} autoComplete="address-level1">
              <option value="">Select</option>
              {US_STATES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            ZIP code
            <input className={fieldClass} required inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" value={customer.zip} onChange={(event) => update("zip", event.target.value)} autoComplete="postal-code" />
          </label>
        </div>
        <label className="block text-sm">
          Country
          <input className={fieldClass} value="United States" readOnly />
        </label>
        <label className="block text-sm">
          Delivery notes
          <textarea className={fieldClass} rows={3} value={customer.deliveryNote} onChange={(event) => update("deliveryNote", event.target.value)} placeholder="Gate code, where to leave the package" />
        </label>
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} className="mt-1" required />
          <span>
            I have read and accept the <Link href="/terms" className="underline underline-offset-4">Terms of Service</Link> and the{" "}
            <Link href="/returns" className="underline underline-offset-4">Return Policy</Link>.
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
              ? "Next, Stripe's secure payment form appears on this page. Card details go directly to Stripe, not to this shop."
              : "Next, you continue to Stripe. Your order is placed once Stripe confirms payment. You enter card details only there, not in this shop."
            : "Card payment isn't available yet. You will not be charged."}
        </p>
        {error ? <p className="mt-3 text-sm text-oak">{error}</p> : null}
        <button className={`${btnPrimary} mt-5 w-full`} type="submit" disabled={pending || catalog.checkoutMode !== "stripe"}>
          {pending ? "Please wait…" : "Continue to secure payment"}
        </button>
      </aside>
    </form>
  );
}
