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
        lede="Alle Preise sind Bruttopreise. Der Versand steht vor dem Abschluss in der Summe. Versteckte Gebühren gibt es nicht."
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
            {catalog.paymentReady
              ? "Stripe ist konfiguriert. Nach der Kasse öffnet sich die Zahlungsseite von Stripe."
              : "Eine Online-Zahlung ist derzeit nicht freigeschaltet. Bestellungen gehen als unverbindliche Anfrage ein. Wir buchen nichts ab und melden uns per E-Mail."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Keine Kartendaten bei uns</h2>
          <p className="mt-3">
            Nummer, Prüfzahl und Ablaufdatum einer Karte werden nicht in diesem Shop eingegeben und nicht gespeichert. Die
            Eingabe erfolgt auf der Seite des Zahlungsanbieters. Eine erfolgreiche Zahlung erkennen wir nur an der Rückmeldung
            von Stripe, nicht an einer selbst gesetzten Erfolgsmeldung.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Offene Zahlungen</h2>
          <p className="mt-3">
            Eine begonnene Stripe-Zahlung reserviert die Menge für {catalog.shipping.reservationHours} Stunden. Wird sie nicht
            abgeschlossen, fällt die Reservierung weg und der Bestand bleibt unverändert. Eine Anfrage ohne Zahlungsanbieter
            verändert den Bestand nicht.
          </p>
        </section>
      </div>
    </>
  );
}
