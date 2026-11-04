import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCart } from "@/components/clear-cart";
import { CustomerReviewsOptIn } from "@/components/customer-reviews-opt-in";
import { PriceBreakdown } from "@/components/price-summary";
import { PurchaseConversion } from "@/components/purchase-conversion";
import { getOrder, markPaid } from "@/lib/catalog";
import { formatMoney, summarize } from "@/lib/money";
import { notifyOrder } from "@/lib/notify";
import { orderMessage, statusLabel } from "@/lib/order-text";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Order", robots: { index: false, follow: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { session_id: sessionId } = await searchParams;
  let order = await getOrder(id);
  if (!order) notFound();

  if (order.status === "zahlung_ausstehend" && sessionId) {
    const stripe = getStripe();
    if (stripe) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.client_reference_id === order.id && session.payment_status === "paid") {
          order = (await markPaid(order.id, session.id)) ?? order;
        }
      } catch {
        order = { ...order, note: "We couldn't check the payment with Stripe, so it isn't marked as paid." };
      }
    }
  }

  if ((order.status === "bezahlt" || order.status === "anfrage" || order.status === "nachnahme") && !order.emailSent) {
    order = await notifyOrder(order);
  }

  const summary = summarize(order.items, order.shippingGrossCents, order.vatRate);
  const message = orderMessage(order);
  const finished = order.status === "bezahlt" || order.status === "anfrage" || order.status === "nachnahme";
  const title =
    order.status === "bezahlt"
      ? "Order confirmed"
      : order.status === "nachnahme"
        ? "Cash on delivery order"
        : order.status === "anfrage"
          ? "Request saved"
          : "Payment not completed";

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      {finished ? <ClearCart /> : null}
      {order.status === "bezahlt" ? <PurchaseConversion orderId={order.id} valueCents={summary.totalGrossCents} /> : null}
      {order.status === "bezahlt" ? (
        <CustomerReviewsOptIn orderId={order.id} email={order.customer.email} createdAt={order.createdAt} />
      ) : null}
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-moss">{statusLabel[order.status]}</p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight">
        {title}
      </h1>
      <p className="mt-4 leading-relaxed text-muted">{order.note}</p>
      <p className="mt-2 text-sm">Order {order.id}</p>
      <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {order.items.map((item) => (
          <li key={item.slug} className="flex justify-between gap-4 py-3 text-sm">
            <span>
              {item.qty} × {item.name}
              <span className="block text-muted">{item.sku}</span>
            </span>
            <span>{formatMoney(item.unitGrossCents * item.qty, order.currency)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <PriceBreakdown summary={summary} shippingLabel={order.shippingLabel} vatRate={order.vatRate} currency={order.currency} />
      </div>
      <p className="mt-6 text-sm leading-relaxed">
        {order.emailSent
          ? "We sent the email for this order."
          : order.emailNote || "No email was sent."}
      </p>
      <h2 className="mt-8 text-lg font-medium">Email contents</h2>
      <pre className="mt-3 whitespace-pre-wrap rounded-3xl bg-paper p-5 text-sm leading-relaxed">{message.text}</pre>
      <Link href="/shop" className="mt-8 inline-block text-sm underline underline-offset-4">
        Back to shop
      </Link>
    </div>
  );
}
