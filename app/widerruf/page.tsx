import type { Metadata } from "next";
import { DraftNotice, PageHeader, Placeholder } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Rückgabe und Widerruf" };

export default async function WithdrawalPage() {
  const { business } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Widerruf"
        title="Rückgabe und Widerruf"
        lede="Verbraucher können einen Fernabsatzvertrag in der Regel innerhalb von 14 Tagen widerrufen. Dieser Text ist eine Arbeitsfassung."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <DraftNotice>Bitte lassen Sie Widerrufsbelehrung und Rücksendekosten vor der Veröffentlichung rechtlich prüfen.</DraftNotice>
        <section>
          <h2 className="text-2xl font-medium">Widerrufsrecht</h2>
          <p className="mt-3">
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Frist beginnt
            an dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Ware in Besitz
            genommen haben.
          </p>
          <p className="mt-3">
            Um das Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung informieren. Dafür reicht das
            Kontaktformular, eine E-Mail oder das untenstehende Muster. Die Adresse steht im Impressum:{" "}
            <Placeholder value={business.legalName} label="Name" />, <Placeholder value={business.street} label="Straße" />,{" "}
            <Placeholder value={[business.zip, business.city].filter(Boolean).join(" ")} label="Ort" />,{" "}
            <Placeholder value={business.email} label="E-Mail" />.
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
            Sie tragen die unmittelbaren Kosten der Rücksendung. Eine Mini-Sauna ist Sperrgut. Die Rückgabe braucht in der
            Regel eine Spedition. Die Kosten hängen von Maß, Gewicht und Adresse ab und können erheblich sein. Einen festen
            Betrag nennen wir erst, wenn der Versanddienstleister ihn bestätigt hat. Bitte stimmen Sie die Abholung vor dem
            Versand mit uns ab, damit die Kabine nicht unangekündigt zurückgeschickt wird.
          </p>
          <p className="mt-3">
            Sie müssen für einen etwaigen Wertverlust nur aufkommen, wenn der Wertverlust auf einen Umgang zurückzuführen ist,
            der zur Prüfung der Beschaffenheit, der Eigenschaften und der Funktionsweise nicht notwendig war.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Muster-Widerrufsformular</h2>
          <div className="mt-3 rounded-3xl bg-paper p-5 text-sm">
            <p>An <Placeholder value={business.legalName} label="Name" />, <Placeholder value={business.email} label="E-Mail" />:</p>
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
