import type { Metadata } from "next";
import { DraftNotice, PageHeader, Placeholder } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default async function PrivacyPage() {
  const { business } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Datenschutz"
        title="Datenschutzerklärung"
        lede="Diese Erklärung beschreibt, welche Daten der Shop verarbeitet. Sie ist eine Arbeitsfassung und vor dem Launch zu prüfen."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <DraftNotice>Verantwortlicher, Hosting und Auftragsverarbeiter müssen mit den echten Dienstleistern übereinstimmen.</DraftNotice>
        <section>
          <h2 className="text-2xl font-medium">Verantwortlicher</h2>
          <p className="mt-3">
            <Placeholder value={business.legalName} label="Name" />, <Placeholder value={business.street} label="Straße" />,{" "}
            <Placeholder value={[business.zip, business.city].filter(Boolean).join(" ")} label="Ort" />,{" "}
            <Placeholder value={business.email} label="E-Mail" />.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Hosting</h2>
          <p className="mt-3">
            Beim Aufruf der Seiten verarbeitet der Hoster technisch erforderliche Verbindungsdaten, etwa IP-Adresse und Zeitpunkt.
            Der konkrete Hoster ist vor dem Launch hier zu benennen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, hilfsweise
            lit. b, soweit der Abruf einem Vertrag dient.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Anfragen und Bestellungen</h2>
          <p className="mt-3">
            Für eine Anfrage oder eine Zahlung verarbeiten wir Name, E-Mail, Lieferadresse, Telefonnummer soweit angegeben,
            die gewählten Modelle und den Vorgangsstatus. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, bei gesetzlichen
            Aufbewahrungspflichten lit. c. Kartendaten, Prüfziffern und Ablaufdaten erheben wir nicht. Wenn Stripe genutzt
            wird, gibt der Kunde diese Daten unmittelbar bei Stripe ein.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Stripe</h2>
          <p className="mt-3">
            Ist Stripe konfiguriert, übermittelt der Shop die für die Zahlung nötigen Vorgangsdaten an Stripe Payments Europe,
            Limited, bzw. die von Stripe benannten Stellen. Stripe ist dann eigener Verantwortlicher für die Zahlungsdaten oder
            Auftragsverarbeiter, je nach Einrichtung des Kontos. Das ist im Stripe-Dashboard und in einem Vertrag nach Art. 28
            DSGVO festzuhalten. Ohne Stripe-Schlüssel findet keine Übermittlung statt.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Kontaktformular</h2>
          <p className="mt-3">
            Name, E-Mail und Nachricht speichern wir, um die Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
            oder lit. f DSGVO. Die Nachricht bleibt gespeichert, bis sie erledigt ist und keine Aufbewahrungspflicht entgegensteht.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Newsletter</h2>
          <p className="mt-3">
            Die Anmeldung erfordert eine aktive Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Wir speichern die Adresse, den
            Einwilligungstext und den Zeitpunkt. Solange keine Bestätigungs-E-Mail mit Bestätigungslink versendet wird, ist das
            Double-Opt-in nicht abgeschlossen. Die Einwilligung kann jederzeit über das Kontaktformular widerrufen werden.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Warenkorb und Cookies</h2>
          <p className="mt-3">
            Der Warenkorb liegt im lokalen Speicher des Browsers und wird nicht als Profil ausgewertet. Für die
            Shop-Verwaltung setzen wir ein notwendiges, httpOnly-Sitzungscookie. Analyse-, Marketing- oder Tracking-Cookies
            sind nicht eingebunden.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">E-Mail-Versand</h2>
          <p className="mt-3">
            E-Mails gehen nur hinaus, wenn ein Anbieter wie Resend mit Absenderadresse konfiguriert ist. Dann werden Empfänger
            und Inhalt der jeweiligen Nachricht an diesen Anbieter übermittelt.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Ihre Rechte</h2>
          <p className="mt-3">
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch,
            soweit die gesetzlichen Voraussetzungen erfüllt sind. Eine erteilte Einwilligung können Sie mit Wirkung für die
            Zukunft widerrufen. Außerdem besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde.
          </p>
        </section>
      </div>
    </>
  );
}
