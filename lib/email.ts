type Mail = {
  to: string;
  subject: string;
  text: string;
  /** Optional HTML version; mail apps that cannot show it use the text. */
  html?: string;
};

export async function sendMail(mail: Mail): Promise<{ sent: boolean; note: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!key || !from) {
    return {
      sent: false,
      note: "E-Mail nicht versendet: Es ist kein E-Mail-Anbieter konfiguriert.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      ...(mail.html ? { html: mail.html } : {}),
    }),
  });

  if (!response.ok) {
    return {
      sent: false,
      note: "E-Mail nicht versendet: Der E-Mail-Anbieter hat die Nachricht abgelehnt.",
    };
  }

  return { sent: true, note: "E-Mail wurde über den konfigurierten Anbieter versendet." };
}
