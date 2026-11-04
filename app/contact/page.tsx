import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { phoneHref, formatAddress } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const catalog = await getCatalog();
  const business = catalog.business;
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Write to us."
        lede="Use this form for questions about a product, delivery, or shipping damage."
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-2">
        <ContactForm />
        <aside className="text-sm leading-relaxed text-muted">
          <p className="font-medium text-ink">Pilands Cards</p>
          {business.street ? (
            <p className="mt-2">
              {formatAddress(business)}
            </p>
          ) : null}
          {business.email ? (
            <p className="mt-2">
              Email:{" "}
              <a href={`mailto:${business.email}`} className="text-ink underline underline-offset-4">
                {business.email}
              </a>
            </p>
          ) : null}
          {business.phone ? (
            <p>
              Phone:{" "}
              <a href={phoneHref(business.phone)} className="text-ink underline underline-offset-4">
                {business.phone}
              </a>
            </p>
          ) : null}
          <p className="mt-4">Email is the fastest way to reach us.</p>
        </aside>
      </div>
    </>
  );
}
