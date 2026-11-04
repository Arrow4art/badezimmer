import type { Metadata } from "next";
import { FaqList } from "@/components/faq-list";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { buildFaqs } from "@/lib/copy";

export const metadata: Metadata = { title: "Frequently asked questions" };

export default async function FaqPage() {
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Frequently asked questions"
        lede="Short answers about products, stock, shipping, and payment."
      />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <FaqList items={buildFaqs(catalog.products, catalog.checkoutMode)} />
      </div>
    </>
  );
}
