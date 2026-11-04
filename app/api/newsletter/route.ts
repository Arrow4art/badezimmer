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
    return NextResponse.json({ error: "Some information is missing." }, { status: 400 });
  }
  const parsed = parseNewsletter(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (!parsed.email) return NextResponse.json({ message: "Saved." });

  await saveNewsletter(parsed.email, NEWSLETTER_CONSENT);
  const mail = await sendMail({
    to: parsed.email,
    subject: "Please confirm your newsletter signup",
    text: `${NEWSLETTER_CONSENT}\n\nThis message only confirms that we received your address. Double opt-in is complete only once a confirmation link is set up. You can withdraw your consent at any time.`,
  });
  if (mail.sent) await markNewsletterMailed(parsed.email);

  return NextResponse.json({
    message: mail.sent
      ? "We sent you an email. Your signup isn't a completed double opt-in until the email includes a confirmation link."
      : "Your consent has been saved. No confirmation email was sent because no email provider is configured, so double opt-in isn't complete yet.",
  });
}
