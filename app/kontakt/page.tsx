import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { phoneHref } from "@/lib/site";

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
          <p className="font-medium text-ink">Badezimmer</p>
          {business.street ? (
            <p className="mt-2">
              {business.street}, {[business.zip, business.city].filter(Boolean).join(" ")}
            </p>
          ) : null}
          {business.email ? (
            <p className="mt-2">
              E-Mail:{" "}
              <a href={`mailto:${business.email}`} className="text-ink underline underline-offset-4">
                {business.email}
              </a>
            </p>
          ) : null}
          {business.phone ? (
            <p>
              Telefon:{" "}
              <a href={phoneHref(business.phone)} className="text-ink underline underline-offset-4">
                {business.phone}
              </a>
            </p>
          ) : null}
          <p className="mt-4">Am schnellsten erreichen Sie uns per E-Mail.</p>
        </aside>
      </div>
    </>
  );
}
