import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getOrder, setEmailResult } from "@/lib/catalog";
import { sendMail } from "@/lib/email";
import { orderMessage } from "@/lib/order-text";

export const dynamic = "force-dynamic";

// Sends (again) the confirmation email of one order to its buyer, e.g. for orders paid before an email provider was set.
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Die Eingaben sind unvollständig." }, { status: 400 });
  }
  const orderId = typeof (body as { orderId?: unknown })?.orderId === "string" ? (body as { orderId: string }).orderId : "";
  const order = orderId ? await getOrder(orderId) : null;
  if (!order) return NextResponse.json({ error: "Vorgang nicht gefunden." }, { status: 404 });
  if (order.status !== "bezahlt" && order.status !== "anfrage" && order.status !== "nachnahme") {
    return NextResponse.json({ error: "Für diesen Status gibt es keine Bestätigung." }, { status: 400 });
  }

  const message = orderMessage(order);
  const result = await sendMail({ to: order.customer.email, subject: message.subject, text: message.text });
  await setEmailResult(order.id, result.sent, result.note);
  if (!result.sent) return NextResponse.json({ error: result.note }, { status: 502 });
  return NextResponse.json({ message: `Bestätigung an ${order.customer.email} gesendet.` });
}
