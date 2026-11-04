import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, btnPrimary } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";
import { phoneHref, formatAddress } from "@/lib/site";

export const metadata: Metadata = {
  title: "About us",
  description: "Pilands Cards sells sealed displays, boxes, and decks for trading card games.",
};

export default async function AboutPage() {
  const { shipping, business, checkoutMode } = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="About Pilands Cards"
        title="Sealed displays and decks."
        lede="Pilands Cards sells products in their original packaging for Pokémon, Magic: The Gathering, One Piece, Yu-Gi-Oh!, and Lorcana."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12 leading-relaxed">
        <p>
          We ship within the United States. Language, contents, and quantity are listed on each product page.
        </p>
        <h2 className="text-2xl font-medium text-ink">Who sells</h2>
        <p>
          Our business address is{" "}
          {formatAddress(business)}, {business.country}.
        </p>
        <h2 className="text-2xl font-medium text-ink">How buying works</h2>
        <p>
          You order directly in this shop. Prices are in USD, and the price in your cart is the final price. No sales
          tax is added at checkout. Import duties, if any, are covered by the shop. Shipping within the United
          States is {shipping.costCents === 0 ? "free" : "listed on the Shipping page"}
          {shipping.deliveryEstimateConfirmed ? ` and takes ${shipping.deliveryEstimateText}` : ""}. Your order arrives
          sealed, in its original packaging.
          {checkoutMode === "stripe"
            ? " You pay by card through Stripe, not on delivery."
            : " Card payment through Stripe isn't active yet. Cash on delivery isn't available."}
        </p>
        <p>
          Each product page lists contents, language, and price. We only show reviews and trust seals when they
          can be verified. We currently have no customer reviews and no trust seals.
        </p>
        <h2 className="text-2xl font-medium text-ink">Policies and contact</h2>
        <p>
          Our <Link href="/terms" className="underline underline-offset-4">Terms</Link> apply, along with the{" "}
          <Link href="/returns" className="underline underline-offset-4">Returns policy</Link> (14-day returns with
          free return shipping on a prepaid label), the <Link href="/shipping" className="underline underline-offset-4">Shipping</Link> and{" "}
          <Link href="/payment" className="underline underline-offset-4">Payment</Link> pages, and the{" "}
          <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>. Seller details are
          in the <Link href="/legal" className="underline underline-offset-4">Legal notice</Link>.
        </p>
        <p>
          You can reach us by email at{" "}
          <a href={`mailto:${business.email}`} className="underline underline-offset-4">
            {business.email}
          </a>
          {business.phone ? (
            <>
              {" "}
              and by phone at{" "}
              <a href={phoneHref(business.phone)} className="underline underline-offset-4">
                {business.phone}
              </a>
            </>
          ) : null}
          . The form is on the <Link href="/contact" className="underline underline-offset-4">Contact page</Link>.
        </p>
        <Link href="/shop" className={btnPrimary}>
          Browse products
        </Link>
      </div>
    </>
  );
}
