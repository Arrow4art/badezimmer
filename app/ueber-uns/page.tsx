import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, btnPrimary } from "@/components/ui";

export const metadata: Metadata = {
  title: "Über uns",
  description: "Badezimmer ist ein Shop für kompakte Mini-Saunen im eigenen Zuhause.",
};

export default function AboutPage() {
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
          Unter „Technische Daten“ stehen nur Angaben, die durch Unterlagen des Herstellers belegt sind. Bewertungen,
          Prüfzeichen und Garantieversprechen veröffentlichen wir nur mit Nachweis.
        </p>
        <p>
          Preise sind Bruttopreise in Euro inklusive Mehrwertsteuer. Die Lieferung innerhalb Deutschlands ist kostenlos.
        </p>
        <Link href="/shop" className={btnPrimary}>
          Saunen entdecken
        </Link>
      </div>
    </>
  );
}
