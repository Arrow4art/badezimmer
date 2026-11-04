import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { formatAddress, phoneHref } from "@/lib/site";

export const metadata: Metadata = { title: "Business Information" };

export default async function LegalPage() {
  const { business } = await getCatalog();
  return (
    <>
      <PageHeader eyebrow="Legal" title="Business Information" lede="Who operates this shop and how to reach us." />
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12 leading-relaxed">
        <p>
          {business.legalName || "Pilands Cards"}
          <br />
          <Placeholder value={formatAddress(business)} label="Business address" />
          <br />
          {business.country || "United States"}
        </p>
        {business.owner ? <p>Owner: {business.owner}</p> : null}
        <p>
          Email: <Placeholder value={business.email} label="Email" />
          {business.phone ? (
            <>
              <br />
              Phone:{" "}
              <a href={phoneHref(business.phone)} className="underline underline-offset-4">
                {business.phone}
              </a>
            </>
          ) : null}
        </p>
      </div>
    </>
  );
}
