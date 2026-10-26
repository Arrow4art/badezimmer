import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { phoneHref } from "@/lib/site";

export const metadata: Metadata = { title: "Impressum" };

export default async function ImpressumPage() {
  const { business } = await getCatalog();
  return (
    <>
      <PageHeader eyebrow="Rechtliches" title="Impressum" lede="Angaben gemäß § 5 DDG." />
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12 leading-relaxed">
        <p>
          Iwoody
          <br />
          Einzelunternehmen
          <br />
          <Placeholder value={business.street} label="Straße und Hausnummer" />
          <br />
          <Placeholder value={[business.zip, business.city].filter(Boolean).join(" ")} label="PLZ und Ort" />
          <br />
          {business.country || "Deutschland"}
        </p>
        {business.owner ? <p>Vertreten durch: {business.owner}</p> : null}
        <p>
          E-Mail: <Placeholder value={business.email} label="E-Mail" />
          {business.phone ? (
            <>
              <br />
              Telefon:{" "}
              <a href={phoneHref(business.phone)} className="underline underline-offset-4">
                {business.phone}
              </a>
            </>
          ) : null}
        </p>
        <p>
          Rechtsform: Einzelunternehmen. Alle Verbraucherpreise sind Bruttopreise
          und enthalten 19 % Umsatzsteuer. Eine Umsatzsteuer-Identifikationsnummer und eine Steuernummer sind nicht hinterlegt.
        </p>
        {business.vatId ? <p>USt-IdNr.: {business.vatId}</p> : null}
        {business.responsiblePerson ? <p>Inhaltlich verantwortlich: {business.responsiblePerson}</p> : null}
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </div>
    </>
  );
}
