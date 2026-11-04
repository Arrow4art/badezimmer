"use client";

import { useState } from "react";
import { CheckoutElementsProvider, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout";
import type { Stripe, StripeCheckoutContact } from "@stripe/stripe-js";
import { btnPrimary } from "@/components/ui";
import { formatPrice } from "@/lib/money";

// Stripe's fields in the shop's own colours (tailwind.config.ts), so the form reads as part of /checkout.
const appearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#FF2BD6",
    colorBackground: "#1D1740",
    colorText: "#F3F0FF",
    colorTextSecondary: "#A49FC6",
    colorDanger: "#FFB547",
    borderRadius: "16px",
    fontFamily: "system-ui, sans-serif",
  },
};

/** Card and the other methods enabled in Stripe, as a form inside /checkout. Card data goes straight to Stripe. */
export function StripePayment({
  stripe,
  clientSecret,
  orderId,
  totalCents,
  billingAddress,
}: {
  stripe: Promise<Stripe | null>;
  clientSecret: string;
  orderId: string;
  totalCents: number;
  /** From the checkout form. The US is the only delivery country. */
  billingAddress: StripeCheckoutContact;
}) {
  return (
    <CheckoutElementsProvider
      stripe={stripe}
      // Prices stay in US dollars (US only).
      options={{ clientSecret, elementsOptions: { appearance }, adaptivePricing: { allowed: false }, defaultValues: { billingAddress } }}
    >
      <PayForm orderId={orderId} totalCents={totalCents} />
    </CheckoutElementsProvider>
  );
}

function PayForm({ orderId, totalCents }: { orderId: string; totalCents: number }) {
  const result = useCheckoutElements();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (result.type === "loading") return <p className="text-sm text-muted">Loading payment form…</p>;
  if (result.type === "error") return <p className="text-sm text-oak">{result.error.message}</p>;
  const { checkout } = result;

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        // Redirect methods leave and come back to the order page; cards may finish here.
        const confirmed = await checkout.confirm({ redirect: "if_required" });
        if (confirmed.type === "error") {
          setPending(false);
          setError(confirmed.error.message);
          return;
        }
        window.location.href = `/order/${encodeURIComponent(orderId)}?session_id=${encodeURIComponent(confirmed.session.id)}`;
      }}
    >
      <PaymentElement />
      {error ? <p className="mt-3 text-sm text-oak">{error}</p> : null}
      <button className={`${btnPrimary} mt-5 w-full`} type="submit" disabled={pending || !checkout.canConfirm}>
        {pending ? "Processing payment…" : `Pay ${formatPrice(totalCents)}`}
      </button>
    </form>
  );
}
