import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Zahlungsinformationen" };

export default async function PaymentPage() {
  const catalog = await getCatalog();
  const percent = Math.round(catalog.vatRate * 100);
  return (
    <>
      <PageHeader
        eyebrow="Zahlung"
        title="Zahlungsinformationen"
        lede={
          catalog.shipping.costCents === 0
            ? `Alle Preise sind Bruttopreise inklusive ${percent} % Mehrwertsteuer. Der Versand innerhalb Deutschlands ist kostenlos. Versteckte Gebühren gibt es nicht.`
            : "Alle Preise sind Bruttopreise. Der Versand steht vor dem Abschluss in der Summe. Versteckte Gebühren gibt es nicht."
        }
      />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <section>
          <h2 className="text-2xl font-medium">Preise und Steuer</h2>
          <p className="mt-3">
            Die Produktpreise enthalten {percent} % deutsche Mehrwertsteuer. An der Kasse weisen wir Nettobetrag, Steuer und
            Bruttobetrag für Ware und Versand getrennt aus. Der Gesamtbetrag ist der zu zahlende Betrag.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Zahlungsarten</h2>
          <p className="mt-3">
            {catalog.checkoutMode === "cod"
              ? "Die Zahlungsart ist Nachnahme. Nach der Bestellung wird nichts abgebucht. Sie zahlen den angezeigten Gesamtbetrag in bar bei der Zustellung an den Zusteller. Ein Nachnahmezuschlag kommt nicht dazu."
              : catalog.checkoutMode === "stripe"
                ? "Sie bezahlen sicher über Stripe. Nach der Kasse öffnet sich die Zahlungsseite von Stripe. Dort sehen Sie alle verfügbaren Zahlungsarten."
                : "Eine Online-Zahlung ist derzeit nicht freigeschaltet. Bestellungen gehen als unverbindliche Anfrage ein. Wir buchen nichts ab und melden uns per E-Mail."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Keine Kartendaten bei uns</h2>
          <p className="mt-3">
            {catalog.checkoutMode === "cod"
              ? "Nummer, Prüfzahl und Ablaufdatum einer Karte werden in diesem Shop nicht abgefragt. Die Bezahlung erfolgt in bar bei der Lieferung."
              : "Nummer, Prüfzahl und Ablaufdatum einer Karte werden nicht in diesem Shop eingegeben und nicht gespeichert. Die Eingabe erfolgt auf der Seite des Zahlungsanbieters. Eine erfolgreiche Zahlung erkennen wir nur an der Rückmeldung von Stripe, nicht an einer selbst gesetzten Erfolgsmeldung."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Offene Zahlungen</h2>
          <p className="mt-3">
            {catalog.checkoutMode === "cod"
              ? "Bei Nachnahme wird nichts online abgebucht. Mit der Bestellung verringert sich der Bestand um die bestellte Menge, weil die Ware für den Versand vorgesehen ist."
              : `Eine begonnene Stripe-Zahlung reserviert die Menge für ${catalog.shipping.reservationHours} Stunden. Wird sie nicht abgeschlossen, fällt die Reservierung weg.`}
          </p>
        </section>
      </div>
    </>
  );
}
