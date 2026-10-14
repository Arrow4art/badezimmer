import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Warenkorb", robots: { index: false, follow: false } };

export default async function CartPage() {
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader eyebrow="Warenkorb" title="Ihre Auswahl" lede="Mengen lassen sich ändern. Die Summe enthält Mehrwertsteuer und den konfigurierten Versand." />
      <CartView catalog={catalog} />
    </>
  );
}
