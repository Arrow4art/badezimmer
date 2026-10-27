import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { formatEUR } from "@/lib/money";

export const metadata: Metadata = { title: "Versand und Lieferung" };

export default async function ShippingPage() {
  const { shipping, installationText } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Versand"
        title="Versand und Lieferung"
        lede={
          shipping.costCents === 0
            ? "Kostenlose Lieferung innerhalb Deutschlands per Paket."
            : "Lieferung innerhalb Deutschlands per Paket. Die Versandkosten sehen Sie vor dem Absenden der Bestellung."
        }
      />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <section>
          <h2 className="text-2xl font-medium">Liefergebiet</h2>
          <p className="mt-3">{shipping.destination}. Eine Lieferung in andere Länder ist nicht eingerichtet.</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Versandkosten</h2>
          <p className="mt-3">
            {shipping.costCents === 0
              ? `Der Versand ist kostenlos („${shipping.label}“).`
              : `${formatEUR(shipping.costCents)} für „${shipping.label}“.`}{" "}
            Die Versandkosten stehen im Warenkorb und an der Kasse, bevor Sie etwas absenden. Weitere Zuschläge werden nur
            berechnet, wenn sie vorher auf dieser Seite und an der Kasse stehen.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Versandvorbereitung</h2>
          <p className="mt-3">{shipping.dispatchText}</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Lieferzeit</h2>
          <p className="mt-3">
            {shipping.deliveryEstimateConfirmed
              ? shipping.deliveryEstimateText
              : "Es liegt keine vom Lieferanten bestätigte Lieferzeit vor. Deshalb nennen wir keine Anzahl von Tagen."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Sendungsverfolgung</h2>
          <p className="mt-3">
            {shipping.trackingText}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Was geliefert wird</h2>
          <p className="mt-3">{shipping.bulkyGoodsText}</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Verpackung</h2>
          {shipping.assemblyText ? <p className="mt-3">{shipping.assemblyText}</p> : null}
          <p className="mt-3">{installationText}</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Schwer erreichbare Orte</h2>
          <p className="mt-3">{shipping.remoteText}</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Transportschäden</h2>
          <p className="mt-3">{shipping.damageText}</p>
        </section>
      </div>
    </>
  );
}
