import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Kontakt" };

export default async function ContactPage() {
  const catalog = await getCatalog();
  const business = catalog.business;
  return (
    <>
      <PageHeader
        eyebrow="Kontakt"
        title="Schreiben Sie uns."
        lede="Fragen zu einem Modell, zur Lieferung oder zu einem Transportschaden erreichen uns über dieses Formular."
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-2">
        <ContactForm />
        <aside className="text-sm leading-relaxed text-muted">
          <p className="font-medium text-ink">{business.legalName || "Badezimmer"}</p>
          <p className="mt-2">{[business.street, business.zip, business.city].filter(Boolean).join(", ") || "Anschrift folgt im Impressum."}</p>
          <p className="mt-2">{business.email || "E-Mail-Adresse folgt im Impressum."}</p>
          <p>{business.phone || "Telefonnummer folgt im Impressum."}</p>
          <p className="mt-4">
            Die Nachricht wird im Shop gespeichert. Eine Weiterleitung per E-Mail erfolgt nur, wenn ein E-Mail-Anbieter konfiguriert ist.
          </p>
        </aside>
      </div>
    </>
  );
}
