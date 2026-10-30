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
            {catalog.checkoutMode === "stripe"
              ? "Sie bezahlen per Karte oder mit Klarna, beides über Stripe. Nach dem Absenden der Kasse erscheint das Zahlungsformular von Stripe auf derselben Seite. Klarna wird angezeigt, wenn Klarna für Sie und den Betrag verfügbar ist. Nachnahme bieten wir nicht an."
              : "Die Zahlungsart ist Karte über Stripe. Das Konto ist noch nicht verbunden, deshalb kann derzeit niemand bezahlen. Nachnahme bieten wir nicht an."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Keine Kartendaten bei uns</h2>
          <p className="mt-3">
            Nummer, Prüfzahl und Ablaufdatum einer Karte werden nicht in diesem Shop eingegeben und nicht gespeichert. Die
            Eingabe erfolgt im Zahlungsformular von Stripe. Bei Klarna gelten zusätzlich die Bedingungen von Klarna. Eine erfolgreiche Zahlung erkennen wir nur an der Rückmeldung von Stripe.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Offene Zahlungen</h2>
          <p className="mt-3">
            Eine begonnene Stripe-Zahlung reserviert die Menge für {catalog.shipping.reservationHours} Stunden. Wird sie nicht
            abgeschlossen, fällt die Reservierung weg. Ohne bestätigte Zahlung wird nichts geliefert.
          </p>
        </section>
      </div>
    </>
  );
}
