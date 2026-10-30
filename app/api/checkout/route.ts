import { NextResponse } from "next/server";
import { attachStripeSession, createPendingOrder, failPendingOrder } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";
import { readStore } from "@/lib/store";
import { getStripe, stripePublishableKey } from "@/lib/stripe";
import type { Order } from "@/lib/types";
import { parseCheckout } from "@/lib/validate";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

async function createSession(stripe: Stripe, order: Order, reservationHours: number) {
  const holdSeconds = Math.min(24, Math.max(1, reservationHours)) * 60 * 60;
  const base: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    locale: "de",
    expires_at: Math.floor(Date.now() / 1000) + holdSeconds,
    customer_email: order.customer.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
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
  const returnUrl = `${siteUrl()}/bestellung/${order.id}?session_id={CHECKOUT_SESSION_ID}`;

  // With a publishable key /kasse builds its own payment form from Stripe Elements (no Stripe page header);
  // otherwise the buyer goes to Stripe's page.
  if (stripePublishableKey()) {
    return stripe.checkout.sessions.create({ ...base, ui_mode: "elements", return_url: returnUrl });
  }
  return stripe.checkout.sessions.create({
    ...base,
    success_url: returnUrl,
    cancel_url: `${siteUrl()}/kasse/abbruch?order=${encodeURIComponent(order.id)}`,
  });
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
    return NextResponse.json(
      { error: "Kartenzahlung über Stripe ist noch nicht freigeschaltet. Es wurde nichts berechnet." },
      { status: 503 },
    );
  }

  const created = await createPendingOrder(parsed.data);
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: 400 });

  try {
    const store = await readStore();
    const session = await createSession(stripe, created.order, store.shipping.reservationHours);
    if (!session.client_secret && !session.url) throw new Error("Stripe lieferte kein Zahlungsformular.");
    await attachStripeSession(created.order.id, session.id);
    return NextResponse.json({
      mode: "stripe",
      id: created.order.id,
      clientSecret: session.client_secret ?? undefined,
      url: session.url ?? undefined,
    });
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
