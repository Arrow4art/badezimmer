import { NextResponse } from "next/server";
import { attachStripeSession, createInquiry, createPendingOrder, failPendingOrder } from "@/lib/catalog";
import { notifyOrder } from "@/lib/notify";
import { siteUrl } from "@/lib/site";
import { getStripe } from "@/lib/stripe";
import type { Order } from "@/lib/types";
import { parseCheckout } from "@/lib/validate";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

async function createSession(stripe: Stripe, order: Order) {
  const base: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    locale: "de",
    customer_email: order.customer.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    success_url: `${siteUrl()}/bestellung/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/kasse/abbruch?order=${encodeURIComponent(order.id)}`,
    line_items: order.items.map((item) => ({
      quantity: item.qty,
      price_data: {
        currency: "eur",
        unit_amount: item.unitGrossCents,
        tax_behavior: "inclusive",
        product_data: {
          name: item.name,
          description: `${item.sku}. Bruttopreis inklusive Mehrwertsteuer.`,
        },
      },
    })),
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: order.shippingLabel.slice(0, 100),
          fixed_amount: { amount: order.shippingGrossCents, currency: "eur" },
          tax_behavior: "inclusive",
        },
      },
    ],
  };

  return stripe.checkout.sessions.create(base);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Die Eingaben sind unvollständig." }, { status: 400 });
  }

  const parsed = parseCheckout(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const stripe = getStripe();
  if (!stripe) {
    const created = await createInquiry(parsed.data);
    if (!created.ok) return NextResponse.json({ error: created.error }, { status: 400 });
    const order = await notifyOrder(created.order);
    return NextResponse.json({ mode: "inquiry", id: order.id });
  }

  const created = await createPendingOrder(parsed.data);
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: 400 });

  try {
    const session = await createSession(stripe, created.order);
    if (!session.url) throw new Error("Stripe lieferte keine Weiterleitung.");
    await attachStripeSession(created.order.id, session.id);
    return NextResponse.json({ mode: "stripe", id: created.order.id, url: session.url });
  } catch {
    await failPendingOrder(
      created.order.id,
      "Stripe hat keine Zahlung gestartet. Es wurde nichts berechnet und der Bestand nicht verringert.",
    );
    return NextResponse.json(
      { error: "Der Zahlungsanbieter ist nicht erreichbar. Es wurde nichts berechnet." },
      { status: 502 },
    );
  }
}
