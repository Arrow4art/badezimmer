import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop-browser";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Shop"
        title="Sechs Mini-Saunen, klar bepreist."
        lede={[
          `Jeder Preis enthält ${Math.round(catalog.vatRate * 100)} % MwSt.`,
          catalog.shipping.costCents === 0
            ? "Der Versand innerhalb Deutschlands ist kostenlos."
            : "Die Versandkosten stehen vor dem Abschluss.",
          catalog.shipping.deliveryEstimateConfirmed ? `Lieferzeit: ${catalog.shipping.deliveryEstimateText}.` : "",
          "Die angezeigte Stückzahl ist der bestellbare Bestand.",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <ShopBrowser products={catalog.products} vatRate={catalog.vatRate} shippingCents={catalog.shipping.costCents} />
    </>
  );
}
