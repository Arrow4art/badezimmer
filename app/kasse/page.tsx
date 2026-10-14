import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Kasse", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Kasse"
        title={catalog.paymentReady ? "Weiter zur Zahlung" : "Unverbindliche Anfrage"}
        lede={
          catalog.paymentReady
            ? "Der Gesamtbetrag steht hier fest. Kartendaten geben Sie erst bei Stripe ein."
            : "Ohne Zahlungsanbieter buchen wir nichts ab und markieren nichts als bezahlt."
        }
      />
      <CheckoutForm catalog={catalog} />
    </>
  );
}
