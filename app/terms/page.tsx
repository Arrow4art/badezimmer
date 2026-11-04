import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Placeholder } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { formatAddress } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const { business, checkoutMode, shipping } = await getCatalog();
  return (
    <>
      <PageHeader eyebrow="Terms" title="Terms of Service" lede="These terms apply to orders shipped to addresses in the United States." />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <section>
          <h2 className="text-2xl font-medium">1. Who we are</h2>
          <p className="mt-3">
            This shop is operated by Pilands Cards, <Placeholder value={formatAddress(business)} label="Business address" />, email{" "}
            {business.email}. By placing an order you agree to these terms. You must be at least 18, or have a parent or guardian
            place the order.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">2. Orders</h2>
          <p className="mt-3">
            Product pages invite you to place an order; they aren’t a binding offer.{" "}
            {checkoutMode === "stripe"
              ? "A sale is complete once Stripe confirms your payment."
              : "No sale can be completed until card payment is connected."}{" "}
            If we can’t fulfill an order, we’ll tell you and refund what you paid.
          </p>
          <p className="mt-3">
            Each product page states the edition language. Many products are German-language or other non-English editions.
            Please check before you order.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">3. Prices and taxes</h2>
          <p className="mt-3">
            Prices are in US dollars. No sales tax is added at checkout, and the total shown at checkout is the amount you pay.
            We cover any import duties. Depending on your state, you may owe use tax directly to your state. See{" "}
            <Link href="/shipping" className="underline underline-offset-4">Shipping</Link>.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">4. Payment</h2>
          <p className="mt-3">
            Payment is processed by Stripe. We never receive or store your full card number. We don’t ship an order until payment
            is confirmed.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">5. Shipping</h2>
          <p className="mt-3">
            We ship within the United States.{" "}
            {shipping.deliveryEstimateConfirmed ? `Estimated delivery: ${shipping.deliveryEstimateText}.` : ""} If we can’t ship
            within the time stated, or within 30 days if no time is stated, we’ll notify you and you may cancel for a full refund.
            Title and risk of loss pass to you on delivery.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">6. Returns</h2>
          <p className="mt-3">
            You can return items within 14 days of delivery with free return shipping. See our{" "}
            <Link href="/returns" className="underline underline-offset-4">Return Policy</Link>.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">7. Warranty</h2>
          <p className="mt-3">
            Products are sold factory sealed as supplied by the manufacturer. Card contents of sealed products are random, and we
            don’t promise any particular card. We offer no separate written warranty. This doesn’t limit any warranty or right that
            can’t be excluded under the law of your state.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">8. Limitation of liability</h2>
          <p className="mt-3">
            To the extent the law allows, our total liability for any order is limited to the amount you paid for it, and we aren’t
            liable for indirect or consequential damages. Some states don’t allow these limits, so they may not apply to you.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">9. Trademarks</h2>
          <p className="mt-3">
            Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh!, Disney Lorcana and other product names are trademarks of their
            owners. Pilands Cards isn’t affiliated with or endorsed by them.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">10. Disputes and changes</h2>
          <p className="mt-3">
            Please contact us first at {business.email}, as most problems can be solved quickly. These terms are governed by the
            laws of the state of our business address, without limiting consumer protections of your home state. We may update
            these terms; the version in effect when you order applies to that order.
          </p>
        </section>
      </div>
    </>
  );
}
