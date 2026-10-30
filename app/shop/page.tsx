import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop-browser";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title="Displays, Boxen und Decks."
        lede={[
          `Jeder Preis enthält ${Math.round(catalog.vatRate * 100)} % MwSt.`,
          catalog.shipping.costCents === 0
            ? "Der Versand innerhalb Deutschlands ist kostenlos."
            : "Die Versandkosten stehen vor dem Abschluss.",
          catalog.shipping.deliveryEstimateConfirmed ? `Lieferzeit: ${catalog.shipping.deliveryEstimateText}.` : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <ShopBrowser
        products={catalog.products}
        vatRate={catalog.vatRate}
        shippingCents={catalog.shipping.costCents}
        initialQuery={q ?? ""}
      />
    </>
  );
}
