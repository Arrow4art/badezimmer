import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Cart", robots: { index: false, follow: false } };

export default async function CartPage() {
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader eyebrow="Cart" title="Your selection" lede="You can change quantities here. The total includes shipping. No sales tax is added at checkout." />
      <CartView catalog={catalog} />
    </>
  );
}
