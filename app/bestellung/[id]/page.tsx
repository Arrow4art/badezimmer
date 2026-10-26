import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCart } from "@/components/clear-cart";
import { PriceBreakdown } from "@/components/price-summary";
import { PurchaseConversion } from "@/components/purchase-conversion";
import { getOrder, markPaid } from "@/lib/catalog";
import { summarize } from "@/lib/money";
import { notifyOrder } from "@/lib/notify";
import { orderMessage, statusLabel } from "@/lib/order-text";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Vorgang", robots: { index: false, follow: false } };

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
        order = { ...order, note: "Die Zahlung konnte bei Stripe nicht geprüft werden. Nichts wurde als bezahlt angenommen." };
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
      ? "Bestellung bestätigt"
      : order.status === "nachnahme"
        ? "Bestellung mit Nachnahme"
        : order.status === "anfrage"
          ? "Anfrage gespeichert"
          : "Zahlung nicht abgeschlossen";

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      {finished ? <ClearCart /> : null}
      {order.status === "bezahlt" ? <PurchaseConversion orderId={order.id} valueCents={summary.totalGrossCents} /> : null}
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-moss">{statusLabel[order.status]}</p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight">
        {title}
      </h1>
      <p className="mt-4 leading-relaxed text-muted">{order.note}</p>
      <p className="mt-2 text-sm">Vorgang {order.id}</p>
      <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {order.items.map((item) => (
          <li key={item.slug} className="flex justify-between gap-4 py-3 text-sm">
            <span>
              {item.qty} × {item.name}
              <span className="block text-muted">{item.sku}</span>
            </span>
            <span>{(item.unitGrossCents * item.qty / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <PriceBreakdown summary={summary} shippingLabel={order.shippingLabel} vatRate={order.vatRate} />
      </div>
      <p className="mt-6 text-sm leading-relaxed">
        {order.emailSent
          ? "Die E-Mail zu diesem Vorgang wurde versendet."
          : order.emailNote || "Es wurde keine E-Mail versendet."}
      </p>
      <h2 className="mt-8 text-lg font-medium">Inhalt der Nachricht</h2>
      <pre className="mt-3 whitespace-pre-wrap rounded-3xl bg-paper p-5 text-sm leading-relaxed">{message.text}</pre>
      <Link href="/shop" className="mt-8 inline-block text-sm underline underline-offset-4">
        Zurück zum Shop
      </Link>
    </div>
  );
}
