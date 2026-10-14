import type { Metadata } from "next";
import { DraftNotice, PageHeader, Placeholder } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Impressum" };

export default async function ImpressumPage() {
  const { business } = await getCatalog();
  return (
    <>
      <PageHeader eyebrow="Rechtliches" title="Impressum" lede="Angaben gemäß § 5 DDG. Leere Felder sind vor der Veröffentlichung zu ersetzen." />
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12 leading-relaxed">
        <DraftNotice>Ohne vollständige Anbieterkennzeichnung darf der Shop nicht öffentlich angeboten werden.</DraftNotice>
        <p>
          <Placeholder value={business.legalName} label="Name oder Firma" />
          <br />
          <Placeholder value={business.street} label="Straße und Hausnummer" />
          <br />
          <Placeholder value={[business.zip, business.city].filter(Boolean).join(" ")} label="PLZ und Ort" />
          <br />
          {business.country || "Deutschland"}
        </p>
        <p>
          Vertreten durch: <Placeholder value={business.owner} label="vertretungsberechtigte Person" />
        </p>
        <p>
          Telefon: <Placeholder value={business.phone} label="Telefon" />
          <br />
          E-Mail: <Placeholder value={business.email} label="E-Mail" />
        </p>
        <p>
          Register: <Placeholder value={business.register} label="Registergericht und Nummer, falls vorhanden" />
          <br />
          USt-IdNr.: <Placeholder value={business.vatId} label="USt-IdNr., falls vorhanden" />
        </p>
        <p>
          Inhaltlich verantwortlich: <Placeholder value={business.responsiblePerson} label="verantwortliche Person" />
        </p>
        <p>
          Eine Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle ist derzeit nicht erklärt
          und vor dem Launch festzulegen. Die frühere EU-Online-Streitbeilegungsplattform wird nicht mehr betrieben.
        </p>
      </div>
    </>
  );
}
