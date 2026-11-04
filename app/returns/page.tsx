import type { Metadata } from "next";
import { PageHeader, Placeholder } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { formatAddress } from "@/lib/site";

export const metadata: Metadata = { title: "Return Policy" };

export default async function ReturnsPage() {
  const { business } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Returns"
        title="Return Policy"
        lede="You can return any order within 14 days of delivery. Return shipping is free."
      />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <section>
          <h2 className="text-2xl font-medium">At a glance</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Return window: 14 days from the day you receive your order.</li>
            <li>Return shipping: free. We email you a prepaid return label.</li>
            <li>Refund: the full purchase price, to your original payment method.</li>
            <li>Exchanges: we don’t offer exchanges. Return the item and place a new order.</li>
            <li>
              To start a return, email <Placeholder value={business.email} label="Email" /> with your order number.
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-medium">How to return an item</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Email us within 14 days of delivery with your order number and the items you’re returning.</li>
            <li>We reply with a prepaid return label.</li>
            <li>Pack the items securely, attach the label and drop off the package with the carrier.</li>
          </ol>
          <p className="mt-3">
            Return address: Pilands Cards, <Placeholder value={formatAddress(business)} label="Return address" />.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Refunds</h2>
          <p className="mt-3">
            We issue your refund within 14 days after we receive the return or you show proof that you shipped it. Your bank or
            card issuer may take a few more days to post it. Your original shipping charge, if any, is refunded too.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Condition of returned items</h2>
          <p className="mt-3">
            Sealed products are collectibles, and their value depends on the factory seal. Please return them unopened. We may
            reduce a refund to reflect lost value if an item was opened or handled beyond what’s needed to inspect it. This
            doesn’t apply to items that arrive damaged or defective.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Damaged, defective or wrong items</h2>
          <p className="mt-3">
            If an item arrives damaged or defective, or isn’t what you ordered, email us with photos. We’ll cover return
            shipping and refund or replace the item. Nothing in this policy limits rights you have under the law.
          </p>
        </section>
      </div>
    </>
  );
}
