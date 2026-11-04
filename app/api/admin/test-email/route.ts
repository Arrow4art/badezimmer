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
  if (!(await isAdmin())) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Some information is missing." }, { status: 400 });
  }
  const to = typeof (body as { to?: unknown })?.to === "string" ? (body as { to: string }).to.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 160) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const catalog = await getCatalog();
  const product = catalog.products[0];
  if (!product) return NextResponse.json({ error: "No product is available for the sample." }, { status: 400 });
  const items = [{ slug: product.slug, sku: product.sku, name: product.name, qty: 1, unitGrossCents: product.priceCents }];
  const summary = summarize(items, catalog.shipping.costCents, catalog.vatRate);
  const order: Order = {
    id: "IW-TEST",
    createdAt: new Date().toISOString(),
    status: "bezahlt",
    customer: {
      firstName: "Jane",
      lastName: "Doe",
      email: to,
      phone: "",
      street: "123 Main St",
      zip: "10001",
      city: "New York",
      country: "United States",
      deliveryNote: "",
    },
    items,
    shippingGrossCents: catalog.shipping.costCents,
    shippingLabel: catalog.shipping.label,
    vatRate: catalog.vatRate,
    currency: "USD",
    goodsGrossCents: summary.goodsGrossCents,
    totalGrossCents: summary.totalGrossCents,
    paymentProvider: "stripe",
    emailSent: false,
    emailNote: "",
    note: "",
  };

  const message = orderMessage(order, "TEST: Sample order confirmation. There is no order and no payment.");
  const result = await sendMail({ to, subject: `[TEST] ${message.subject}`, text: message.text, html: message.html });
  if (!result.sent) return NextResponse.json({ error: result.note }, { status: 502 });
  return NextResponse.json({ message: `Test order confirmation sent to ${to}.` });
}
