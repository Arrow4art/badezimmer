import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { sendMail } from "@/lib/email";
import { summarize } from "@/lib/money";
import { orderMessage } from "@/lib/order-text";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

// Sends the order confirmation a buyer gets after paying, for a made-up order, so the owner can see it in a real inbox.
// Nothing is saved and no payment is involved.
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Die Eingaben sind unvollständig." }, { status: 400 });
  }
  const to = typeof (body as { to?: unknown })?.to === "string" ? (body as { to: string }).to.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 160) {
    return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse eingeben." }, { status: 400 });
  }

  const catalog = await getCatalog();
  const product = catalog.products[0];
  if (!product) return NextResponse.json({ error: "Kein Produkt für das Beispiel vorhanden." }, { status: 400 });
  const items = [{ slug: product.slug, sku: product.sku, name: product.name, qty: 1, unitGrossCents: product.priceCents }];
  const summary = summarize(items, catalog.shipping.costCents, catalog.vatRate);
  const order: Order = {
    id: "IW-TEST",
    createdAt: new Date().toISOString(),
    status: "bezahlt",
    customer: {
      firstName: "Max",
      lastName: "Mustermann",
      email: to,
      phone: "",
      street: "Musterstraße 1",
      zip: "45127",
      city: "Essen",
      country: "Deutschland",
      deliveryNote: "",
    },
    items,
    shippingGrossCents: catalog.shipping.costCents,
    shippingLabel: catalog.shipping.label,
    vatRate: catalog.vatRate,
    goodsGrossCents: summary.goodsGrossCents,
    totalGrossCents: summary.totalGrossCents,
    paymentProvider: "stripe",
    emailSent: false,
    emailNote: "",
    note: "",
  };

  const message = orderMessage(order);
  const result = await sendMail({
    to,
    subject: `[TEST] ${message.subject}`,
    text: `TEST: Beispiel einer Bestellbestätigung. Es gibt keine Bestellung und keine Zahlung.\n\n${message.text}`,
  });
  if (!result.sent) return NextResponse.json({ error: result.note }, { status: 502 });
  return NextResponse.json({ message: `Test-Bestellbestätigung an ${to} gesendet.` });
}
