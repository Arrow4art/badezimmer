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
        title={catalog.checkoutMode === "stripe" ? "Weiter zur Zahlung" : "Zahlung noch nicht freigeschaltet"}
        lede={
          catalog.checkoutMode === "stripe"
            ? "Der Gesamtbetrag steht hier fest. Kartendaten geben Sie erst bei Stripe ein. Nachnahme gibt es nicht."
            : "Kartenzahlung über Stripe ist noch nicht verbunden. Nachnahme gibt es nicht. Es wird nichts abgebucht."
        }
      />
      <CheckoutForm catalog={catalog} />
    </>
  );
}
