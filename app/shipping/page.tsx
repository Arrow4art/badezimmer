import type { Metadata } from "next";
import { ShippingSteps } from "@/components/shipping-steps";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Shipping" };

export default async function ShippingPage() {
  const { shipping, installationText, products } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Shipping"
        title="Shipping"
        lede={
          shipping.costCents === 0
            ? "Free shipping to addresses in the United States."
            : "We ship to addresses in the United States. You see the shipping cost before you place your order."
        }
      />
      <ShippingSteps shipping={shipping} products={products} />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <section>
          <h2 className="text-2xl font-medium">Where we ship</h2>
          <p className="mt-3">{shipping.destination}. We don’t currently ship to other countries.</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Shipping cost</h2>
          <p className="mt-3">
            {shipping.costCents === 0 ? `Shipping is free (${shipping.label}).` : `${formatPrice(shipping.costCents)} for ${shipping.label}.`}{" "}
            You see it in your cart and at checkout before you pay.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Duties and taxes</h2>
          <p className="mt-3">We cover any import duties, so you pay nothing extra on delivery. No sales tax is added at checkout.</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Processing</h2>
          <p className="mt-3">{shipping.dispatchText}</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Delivery time</h2>
          <p className="mt-3">
            {shipping.deliveryEstimateConfirmed
              ? shipping.deliveryEstimateText
              : "We ship within 30 days of payment. If we can't, we'll notify you and you may cancel for a full refund."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Tracking</h2>
          <p className="mt-3">{shipping.trackingText}</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">What we ship</h2>
          <p className="mt-3">{shipping.bulkyGoodsText}</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Packaging</h2>
          {shipping.assemblyText ? <p className="mt-3">{shipping.assemblyText}</p> : null}
          <p className="mt-3">{installationText}</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Remote addresses</h2>
          <p className="mt-3">{shipping.remoteText}</p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Damage in transit</h2>
          <p className="mt-3">{shipping.damageText}</p>
        </section>
      </div>
    </>
  );
}
