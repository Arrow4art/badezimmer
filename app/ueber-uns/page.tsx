import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, btnPrimary } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Über uns",
  description: "Badezimmer ist ein Shop für kompakte Mini-Saunen im eigenen Zuhause.",
};

export default async function AboutPage() {
  const { shipping, business, checkoutMode } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Über Badezimmer"
        title="Ruhige Kabinen für den eigenen Raum."
        lede="Badezimmer verkauft kompakte Mini-Saunen für Menschen, die zu Hause einen klaren Ort für Wärme und Ruhe wollen."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12 leading-relaxed">
        <p>
          Der Shop richtet sich an Eigentümer und Mieter in Deutschland, die eine kleine Kabine im Bad, in einer Wohnung
          oder in einem eigenen Wellnessraum unterbringen möchten. Die Gestaltung orientiert sich an hellem Holz, Glas
          und viel Ruhe im Bild.
        </p>
        <p>
          Maße, Holz, Leistung und Prüfzeichen veröffentlichen wir erst, wenn Unterlagen des Herstellers sie belegen. Bis
          dahin beantworten wir Fragen dazu per E-Mail an {business.email}. Bewertungen und Garantieversprechen
          veröffentlichen wir nur mit Nachweis.
        </p>
        <p>
          Preise sind Bruttopreise in Euro inklusive Mehrwertsteuer. Die Lieferung innerhalb Deutschlands ist{" "}
          {shipping.costCents === 0 ? "kostenlos" : "auf der Seite Versand ausgewiesen"}
          {shipping.deliveryEstimateConfirmed ? ` und dauert ${shipping.deliveryEstimateText}` : ""}.
          {checkoutMode === "cod" ? " Bezahlt wird per Nachnahme bei der Lieferung." : ""}
        </p>
        <Link href="/shop" className={btnPrimary}>
          Saunen entdecken
        </Link>
      </div>
    </>
  );
}
