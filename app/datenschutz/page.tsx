import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default async function PrivacyPage() {
  const { business } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Datenschutz"
        title="Datenschutzerklärung"
        lede="Diese Erklärung beschreibt, welche Daten der Shop verarbeitet."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
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
            Die Seiten werden bei Vercel Inc., USA, gehostet. Beim Aufruf verarbeitet Vercel technisch erforderliche
            Verbindungsdaten, etwa IP-Adresse und Zeitpunkt. Dabei können Daten in den USA verarbeitet werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, hilfsweise
            lit. b, soweit der Abruf einem Vertrag dient.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Anfragen und Bestellungen</h2>
          <p className="mt-3">
            Für eine Anfrage oder eine Zahlung verarbeiten wir Name, E-Mail, Lieferadresse, Telefonnummer soweit angegeben,
            die gewählten Modelle und den Vorgangsstatus. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, bei gesetzlichen
            Aufbewahrungspflichten lit. c. Kartendaten, Prüfziffern und Ablaufdaten erheben wir nicht. Diese Daten geben Sie
            unmittelbar bei Stripe ein. Bestellungen, Kontaktnachrichten und Newsletter-Anmeldungen speichern wir in einer
            Datenbank von Upstash, Inc., die über Vercel bereitgestellt wird.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Stripe</h2>
          <p className="mt-3">
            Für die Zahlung übermittelt der Shop die nötigen Vorgangsdaten an Stripe Payments Europe, Limited, 1 Grand Canal
            Street Lower, Dublin, Irland. Dazu gehören Bestellnummer, E-Mail-Adresse, Modelle und Beträge. Stripe verarbeitet
            die Zahlungsdaten als eigener Verantwortlicher. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Weitere
            Informationen finden Sie in der Datenschutzerklärung von Stripe unter stripe.com/de/privacy.
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
            Shop-Verwaltung setzen wir ein notwendiges, httpOnly-Sitzungscookie. Das Google-Tag für Google Ads startet mit
            abgelehntem Werbungsspeicher. Erst wenn Sie im Hinweis auf „Zustimmen“ klicken, werden Werbungsspeicher und
            personalisierte Werbung erlaubt. „Ablehnen“ lässt den Speicher aus. Die Wahl bleibt in diesem Browser gespeichert.
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
