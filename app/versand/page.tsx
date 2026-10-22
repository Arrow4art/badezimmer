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
        lede="Lieferung innerhalb Deutschlands per Spedition. Die Versandkosten sehen Sie vor dem Absenden der Bestellung."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <section>
          <h2 className="text-2xl font-medium">Liefergebiet</h2>
          <p className="mt-3">{shipping.destination}. Eine Lieferung in andere Länder ist nicht eingerichtet.</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Versandkosten</h2>
          <p className="mt-3">
            {formatEUR(shipping.costCents)} für „{shipping.label}“. Der Betrag ist nicht als kostenfreie Lieferung hinterlegt.
            Er erscheint im Warenkorb und an der Kasse, bevor Sie etwas absenden. Weitere Zuschläge werden nur berechnet, wenn
            sie vorher auf dieser Seite und an der Kasse stehen.
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
            {shipping.trackingAvailable ? "Tracking ist nach aktueller Einstellung vorgesehen. " : "Tracking ist derzeit nicht angebunden. "}
            {shipping.trackingText}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Sperrgut</h2>
          <p className="mt-3">{shipping.bulkyGoodsText}</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Liefertermin</h2>
          <p className="mt-3">
            {shipping.appointmentRequired
              ? shipping.appointmentText
              : "Ein separater Liefertermin muss nicht bestätigt werden."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Montage</h2>
          <p className="mt-3">
            {shipping.assemblyIncluded ? "Die Montage ist nach aktueller Einstellung enthalten. " : "Die Montage ist nicht enthalten. "}
            {shipping.assemblyText}
          </p>
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
