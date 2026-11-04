import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Payment Information" };

export default async function PaymentPage() {
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Payment"
        title="Payment Information"
        lede={
          catalog.shipping.costCents === 0
            ? "All prices are in US dollars. Shipping within the United States is free, and there are no hidden fees."
            : "All prices are in US dollars. Shipping is shown in your total before you pay, and there are no hidden fees."
        }
      />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 leading-relaxed">
        <section>
          <h2 className="text-2xl font-medium">Prices and taxes</h2>
          <p className="mt-3">
            No sales tax is added at checkout, and we cover any import duties. The total at checkout is the amount you pay. Depending on
            your state, you may owe use tax directly to your state.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Payment methods</h2>
          <p className="mt-3">
            {catalog.checkoutMode === "stripe"
              ? "You pay by card through Stripe. Stripe's payment form appears on the checkout page, along with any other methods available for your order."
              : "Card payment through Stripe isn't connected yet, so payment isn't possible right now."}
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Your card details</h2>
          <p className="mt-3">
            You enter your card number, security code and expiration date in Stripe’s payment form, and we never store them. We treat a
            payment as successful only when Stripe confirms it.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-medium">Unfinished payments</h2>
          <p className="mt-3">
            Starting a payment holds the items for {catalog.shipping.reservationHours} hours. If you don’t finish, the hold ends. We don’t
            ship without a confirmed payment.
          </p>
        </section>
      </div>
    </>
  );
}
