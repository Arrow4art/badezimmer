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
          Wir trennen Infrarotkabinen und klassische Saunen. Jede Produktseite sagt, welche Art vorgesehen ist, und lässt
          offene Technikangaben offen. Maße, Holzart, Heizleistung und Anschluss stehen erst fest, wenn der Lieferant sie
          bestätigt hat. Bewertungen, Prüfzeichen und Garantieversprechen erfinden wir nicht.
        </p>
        <p>
          Preise sind Bruttopreise in Euro. Der Versand ist eine eigene, sichtbare Position. Solange kein Zahlungsanbieter
          eingerichtet ist, kann man eine Anfrage senden, aber nichts bezahlen.
        </p>
        <Link href="/shop" className={btnPrimary}>
          Saunen entdecken
        </Link>
      </div>
    </>
  );
}
