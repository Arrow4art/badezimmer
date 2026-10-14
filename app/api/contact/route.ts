import { NextResponse } from "next/server";
import { saveMessage } from "@/lib/catalog";
import { sendMail } from "@/lib/email";
import { parseContact } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Die Eingaben sind unvollständig." }, { status: 400 });
  }
  const parsed = parseContact(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  await saveMessage(parsed.data);

  const inbox = process.env.ORDER_EMAIL_FROM;
  if (inbox && process.env.RESEND_API_KEY) {
    await sendMail({
      to: inbox,
      subject: `Kontaktanfrage von ${parsed.data.name}`,
      text: `${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
    });
  }

  return NextResponse.json({
    message:
      "Ihre Nachricht ist gespeichert. Wenn kein E-Mail-Anbieter konfiguriert ist, geht sie nicht zusätzlich per E-Mail hinaus.",
  });
}
