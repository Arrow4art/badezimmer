import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, btnPrimary } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { phoneHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Über uns",
  description: "Iwoody verkauft versiegelte Displays, Boxen und Decks für Sammelkartenspiele.",
};

export default async function AboutPage() {
  const { shipping, business, checkoutMode } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Über Iwoody"
        title="Versiegelte Displays und Decks."
        lede="Iwoody verkauft originalverpackte Produkte für Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh! und Lorcana."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12 leading-relaxed">
        <p>
          Der Shop liefert innerhalb Deutschlands. Sprache, Inhalt und Stückzahl stehen auf der jeweiligen Produktseite.
        </p>
        <h2 className="text-2xl font-medium text-ink">Wer verkauft</h2>
        <p>
          Iwoody ist ein Einzelunternehmen. Die Anschrift ist{" "}
          {business.street}, {business.zip} {business.city}, {business.country}. Eine USt-IdNr. ist nicht hinterlegt. Die
          Verbraucherpreise enthalten 19 % Umsatzsteuer.
        </p>
        <h2 className="text-2xl font-medium text-ink">So funktioniert der Kauf</h2>
        <p>
          Sie bestellen direkt in diesem Shop. Der Preis im Warenkorb ist der Endpreis. Die
          Lieferung innerhalb Deutschlands ist {shipping.costCents === 0 ? "kostenlos" : "auf der Seite Versand ausgewiesen"}
          {shipping.deliveryEstimateConfirmed ? ` und dauert ${shipping.deliveryEstimateText}` : ""}. Die Ware kommt
          originalverpackt. Eine Montage ist nicht erforderlich.
          {checkoutMode === "stripe"
            ? " Sie zahlen per Karte über Stripe, nicht bei der Lieferung."
            : " Die Kartenzahlung über Stripe ist noch nicht freigeschaltet. Nachnahme gibt es nicht."}
        </p>
        <p>
          Auf der Produktseite stehen Inhalt, Sprache und Preis. Bewertungen
          und Gütesiegel zeigen wir nur, wenn sie belegt sind. Derzeit liegen keine Kundenbewertungen und keine Prüfzeichen
          vor.
        </p>
        <h2 className="text-2xl font-medium text-ink">Regeln und Kontakt</h2>
        <p>
          Es gelten die <Link href="/agb" className="underline underline-offset-4">AGB</Link>, die{" "}
          <Link href="/widerruf" className="underline underline-offset-4">Widerrufsbelehrung</Link> mit 14 Tagen
          Widerrufsfrist, die Seiten <Link href="/versand" className="underline underline-offset-4">Versand</Link> und{" "}
          <Link href="/zahlung" className="underline underline-offset-4">Zahlung</Link> sowie die{" "}
          <Link href="/datenschutz" className="underline underline-offset-4">Datenschutzerklärung</Link>. Der Verkäufer
          steht im <Link href="/impressum" className="underline underline-offset-4">Impressum</Link>.
        </p>
        <p>
          Sie erreichen uns per E-Mail an{" "}
          <a href={`mailto:${business.email}`} className="underline underline-offset-4">
            {business.email}
          </a>
          {business.phone ? (
            <>
              {" "}
              und telefonisch unter{" "}
              <a href={phoneHref(business.phone)} className="underline underline-offset-4">
                {business.phone}
              </a>
            </>
          ) : null}
          . Das Formular liegt auf der <Link href="/kontakt" className="underline underline-offset-4">Kontaktseite</Link>.
        </p>
        <Link href="/shop" className={btnPrimary}>
          Saunen entdecken
        </Link>
      </div>
    </>
  );
}
