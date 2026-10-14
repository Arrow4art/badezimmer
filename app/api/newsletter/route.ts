import { NextResponse } from "next/server";
import { markNewsletterMailed, saveNewsletter } from "@/lib/catalog";
import { NEWSLETTER_CONSENT } from "@/lib/copy";
import { sendMail } from "@/lib/email";
import { parseNewsletter } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Die Eingaben sind unvollständig." }, { status: 400 });
  }
  const parsed = parseNewsletter(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (!parsed.email) return NextResponse.json({ message: "Gespeichert." });

  await saveNewsletter(parsed.email, NEWSLETTER_CONSENT);
  const mail = await sendMail({
    to: parsed.email,
    subject: "Bitte bestätigen Sie Ihre Newsletter-Anmeldung",
    text: `${NEWSLETTER_CONSENT}\n\nDiese Nachricht bestätigt nur, dass wir Ihre Adresse erhalten haben. Ein abgeschlossenes Double-Opt-in entsteht erst, wenn ein Bestätigungslink eingerichtet ist. Sie können die Einwilligung jederzeit widerrufen.`,
  });
  if (mail.sent) await markNewsletterMailed(parsed.email);

  return NextResponse.json({
    message: mail.sent
      ? "Wir haben eine E-Mail gesendet. Die Anmeldung ist noch kein abgeschlossenes Double-Opt-in, solange kein Bestätigungslink enthalten ist."
      : "Ihre Einwilligung ist gespeichert. Eine Bestätigungs-E-Mail wurde nicht versendet, weil kein E-Mail-Anbieter konfiguriert ist. Damit ist das Double-Opt-in noch nicht abgeschlossen.",
  });
}
