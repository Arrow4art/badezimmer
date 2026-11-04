import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { stripePublishableKey } from "@/lib/stripe";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Checkout"
        title={catalog.checkoutMode === "stripe" ? "Continue to payment" : "Payment not available yet"}
        lede={
          catalog.checkoutMode === "stripe"
            ? "Your total is shown here. You enter card details in Stripe's secure payment form."
            : "Card payment isn't connected yet. You will not be charged."
        }
      />
      <CheckoutForm catalog={catalog} publishableKey={stripePublishableKey()} />
    </>
  );
}
