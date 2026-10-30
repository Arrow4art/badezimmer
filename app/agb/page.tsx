import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Allgemeine Geschäftsbedingungen" };

export default async function TermsPage() {
  const { business, checkoutMode, shipping } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="AGB"
        title="Allgemeine Geschäftsbedingungen"
        lede="Bedingungen für Bestellungen von Verbrauchern mit Lieferadresse in Deutschland."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <section>
          <h2 className="text-2xl font-medium">1. Geltung</h2>
          <p className="mt-3">
            Diese Bedingungen gelten für Bestellungen im Shop Iwoody durch Verbraucher mit Lieferadresse in Deutschland.
            Vertragspartner ist Iwoody, Einzelunternehmen,{" "}
            {[business.street, [business.zip, business.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}, E-Mail{" "}
            {business.email}.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">2. Angebot und Vertragsschluss</h2>
          <p className="mt-3">
            Die Produktseiten sind eine Aufforderung zur Bestellung.{" "}
            {checkoutMode === "stripe"
              ? "Ein Kaufvertrag kommt erst zustande, wenn die Zahlung über Stripe bestätigt ist."
              : "Solange Stripe nicht verbunden ist, kann kein Kaufvertrag abgeschlossen werden."}
          </p>
          <p className="mt-3">
            Verbindlich sind Preis, Lieferzeit und die auf der Produktseite veröffentlichten Eigenschaften. Maße, Material
            und Leistung, die dort nicht stehen, sind nicht zugesichert. Die Abbildung zeigt den bestellten Artikel.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">3. Preise und Versand</h2>
          <p className="mt-3">
            Preise sind Bruttopreise in Euro inklusive der gesetzlichen Mehrwertsteuer. Der Versandpreis wird vor dem Absenden
            ausgewiesen und ist im Gesamtbetrag enthalten. Weitere Gebühren werden nicht nachträglich hinzugefügt. Details stehen
            auf der Seite <Link href="/versand" className="underline underline-offset-4">Versand und Lieferung</Link>.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">4. Zahlung</h2>
          <p className="mt-3">
            Die Zahlung erfolgt per Karte oder mit Klarna, jeweils über Stripe. Bei Klarna gelten zusätzlich die Bedingungen von Klarna. Kartendaten werden nicht bei uns gespeichert. Nachnahme bieten wir nicht
            an. Ohne bestätigte Zahlung liefern wir nicht.
            {checkoutMode === "stripe" ? "" : " Das Stripe-Konto ist derzeit noch nicht verbunden."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">5. Lieferung</h2>
          <p className="mt-3">
            Geliefert wird innerhalb Deutschlands als Paket.{" "}
            {shipping.deliveryEstimateConfirmed
              ? `Die Lieferzeit beträgt ${shipping.deliveryEstimateText}.`
              : "Eine Lieferfrist nennen wir nur, wenn sie bestätigt ist."}{" "}
            Die Ware kommt originalverpackt.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">6. Eigentumsvorbehalt</h2>
          <p className="mt-3">Die Ware bleibt bis zur vollständigen Zahlung unser Eigentum.</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">7. Widerruf</h2>
          <p className="mt-3">
            Verbrauchern steht das gesetzliche Widerrufsrecht zu. Die Belehrung und das Musterformular stehen auf der Seite{" "}
            <Link href="/widerruf" className="underline underline-offset-4">Rückgabe und Widerruf</Link>.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">8. Gewährleistung</h2>
          <p className="mt-3">
            Es gilt das gesetzliche Mängelrecht. Eine zusätzliche Garantie wird nicht eingeräumt. Gesetzliche Rechte werden
            durch diese Bedingungen nicht eingeschränkt.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">9. Haftung</h2>
          <p className="mt-3">
            Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit.
            Bei einfacher Fahrlässigkeit haften wir nur für die Verletzung wesentlicher Vertragspflichten, begrenzt auf den
            vorhersehbaren, vertragstypischen Schaden. Zwingende Haftung nach dem Produkthaftungsgesetz bleibt unberührt.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">10. Streitbeilegung</h2>
          <p className="mt-3">
            Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </section>
      </div>
    </>
  );
}
