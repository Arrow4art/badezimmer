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
        title="Displays, boxes, and decks."
        lede={[
          "All prices are in USD. No sales tax is added at checkout.",
          catalog.shipping.costCents === 0
            ? "Shipping within the United States is free."
            : "Shipping costs are shown before you place your order.",
          catalog.shipping.deliveryEstimateConfirmed ? `Delivery time: ${catalog.shipping.deliveryEstimateText}.` : "",
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
