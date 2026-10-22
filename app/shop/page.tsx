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
        lede="Jeder Preis enthält 19 % MwSt. Der Versand kommt dazu und steht vor dem Abschluss. Der Bestand ist der hinterlegte Shop-Bestand."
      />
      <ShopBrowser products={catalog.products} vatRate={catalog.vatRate} shippingCents={catalog.shipping.costCents} />
    </>
  );
}
