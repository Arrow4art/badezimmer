import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { cancelPendingOrder, markPaid } from "@/lib/catalog";
import { notifyOrder } from "@/lib/notify";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Der Webhook ist nicht konfiguriert." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signatur fehlt." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Signatur ungültig." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid" && session.client_reference_id) {
      const order = await markPaid(session.client_reference_id, session.id);
      if (order?.status === "bezahlt") await notifyOrder(order);
    }
  }

  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.client_reference_id) {
      await cancelPendingOrder(
        session.client_reference_id,
        "Die Zahlung wurde nicht abgeschlossen. Es wurde nichts berechnet.",
      );
    }
  }

  return NextResponse.json({ received: true });
}
