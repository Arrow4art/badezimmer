import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Rückgabe und Widerruf" };

export default async function WithdrawalPage() {
  const { business, shipping } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Widerruf"
        title="Rückgabe und Widerruf"
        lede="Sie können jede Bestellung innerhalb von 14 Tagen nach Erhalt ohne Angabe von Gründen zurückgeben."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <section>
          <h2 className="text-2xl font-medium">Rückgabe auf einen Blick</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Rückgabefrist: 14 Tage ab Erhalt der Ware.</li>
            {shipping.deliveryEstimateConfirmed ? (
              <li>
                Lieferzeit: {shipping.deliveryEstimateText}. Die Widerrufsfrist beginnt mit dem Erhalt der Ware, nicht mit
                der Bestellung.
              </li>
            ) : null}
            <li>Zurückgegeben werden können mangelfreie und mangelhafte Artikel.</li>
            <li>Ein Umtausch gegen ein anderes Modell wird nicht angeboten. Sie erhalten den Kaufpreis zurück.</li>
            <li>
              Bei einer Rückgabe ohne Mangel tragen Sie die Kosten der Rücksendung. Bei einem Mangel tragen wir die Kosten.
            </li>
            <li>Die Erstattung erfolgt über dasselbe Zahlungsmittel, das Sie bei der Bestellung verwendet haben.</li>
            <li>
              Rückgaben melden Sie per E-Mail an <Placeholder value={business.email} label="E-Mail" />.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Widerrufsrecht</h2>
          <p className="mt-3">
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Frist beginnt
            an dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Ware in Besitz
            genommen haben.
          </p>
          <p className="mt-3">
            Um das Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung informieren, zum Beispiel per
            E-Mail oder mit dem untenstehenden Muster:{" "}
            <Placeholder value={business.legalName} label="Name" />, <Placeholder value={business.street} label="Straße" />,{" "}
            <Placeholder value={[business.zip, business.city].filter(Boolean).join(" ")} label="Ort" />,{" "}
            <Placeholder value={business.email} label="E-Mail" />. Zur Wahrung der Frist reicht es, dass Sie die Mitteilung vor
            Ablauf der Frist absenden.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Folgen des Widerrufs</h2>
          <p className="mt-3">
            Wenn Sie den Vertrag widerrufen, erstatten wir alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich
            der Lieferkosten für die günstigste angebotene Standardlieferung, unverzüglich und spätestens binnen vierzehn
            Tagen ab dem Eingang Ihres Widerrufs. Für die Erstattung verwenden wir dasselbe Zahlungsmittel, das Sie eingesetzt
            haben, sofern nichts anderes vereinbart wird.
          </p>
          <p className="mt-3">
            Wir können die Erstattung verweigern, bis wir die Ware zurückerhalten haben oder Sie den Nachweis erbracht haben,
            dass Sie die Ware abgesandt haben.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Rücksendung von Sperrgut</h2>
          <p className="mt-3">
            Bei einem Widerruf ohne Mangel tragen Sie die unmittelbaren Kosten der Rücksendung. Eine Mini-Sauna ist Sperrgut
            und wird per Spedition zurückgeschickt. Die Kosten hängen von Maß, Gewicht und Adresse ab und können erheblich
            sein. Bitte stimmen Sie die Abholung vorher per E-Mail mit uns ab.
          </p>
          <p className="mt-3">
            Sie müssen für einen etwaigen Wertverlust nur aufkommen, wenn der Wertverlust auf einen Umgang zurückzuführen ist,
            der zur Prüfung der Beschaffenheit, der Eigenschaften und der Funktionsweise nicht notwendig war.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Mangelhafte Ware</h2>
          <p className="mt-3">
            Ist die Ware bei Lieferung beschädigt oder mangelhaft, gilt das gesetzliche Mängelrecht. Die Kosten der
            Rücksendung übernehmen in diesem Fall wir. Melden Sie den Mangel mit Fotos per E-Mail.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Muster-Widerrufsformular</h2>
          <div className="mt-3 rounded-3xl bg-paper p-5 text-sm">
            <p>
              An <Placeholder value={business.legalName} label="Name" />, <Placeholder value={business.street} label="Straße" />,{" "}
              <Placeholder value={[business.zip, business.city].filter(Boolean).join(" ")} label="Ort" />,{" "}
              <Placeholder value={business.email} label="E-Mail" />:
            </p>
            <p className="mt-3">
              Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über den Kauf der folgenden Waren:
            </p>
            <p className="mt-3">Bestellt am / erhalten am:</p>
            <p className="mt-3">Name des/der Verbraucher(s):</p>
            <p className="mt-3">Anschrift des/der Verbraucher(s):</p>
            <p className="mt-3">Datum:</p>
          </div>
        </section>
      </div>
    </>
  );
}
