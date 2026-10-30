import { formatEUR, summarize } from "@/lib/money";
import { PRODUCTION_URL } from "@/lib/site";
import type { Order, OrderStatus } from "@/lib/types";

export const statusLabel: Record<OrderStatus, string> = {
  anfrage: "Anfrage, nicht bezahlt",
  zahlung_ausstehend: "Zahlung offen",
  nachnahme: "Nachnahme, Zahlung bei Lieferung",
  bezahlt: "Bezahlt",
  abgelaufen: "Zahlungsfrist abgelaufen",
  storniert: "Abgebrochen",
  fehlgeschlagen: "Zahlung nicht gestartet",
};

/** Short alert for the shop owner (Telegram): what was ordered, by whom, and where it goes. */
export function ownerAlert(order: Order, adminUrl: string): string {
  const heading = order.status === "anfrage" ? "Neue Anfrage" : "Neue Bestellung";
  const c = order.customer;
  return [
    `🛒 ${heading} ${order.id}`,
    `${statusLabel[order.status]} · ${formatEUR(order.totalGrossCents)}`,
    "",
    ...order.items.map((item) => `${item.qty} × ${item.name}`),
    "",
    `${c.firstName} ${c.lastName}`,
    [c.email, c.phone].filter(Boolean).join(" · "),
    `${c.street}, ${c.zip} ${c.city}`,
    "",
    adminUrl,
  ].join("\n");
}

type MessageParts = {
  intro: string[];
  /** Lines right under the delivery address (the phone number for cash on delivery). */
  afterAddress: string[];
  outro: string[];
};

function messageParts(order: Order, totalGrossCents: number): MessageParts {
  const delivery = ["Die Lieferung innerhalb Deutschlands dauert 0–3 Werktage.", "Die Ware kommt originalverpackt."];
  if (order.status === "nachnahme") {
    return {
      intro: [
        "Ihre Bestellung ist eingegangen. Sie zahlen per Nachnahme.",
        `Bitte halten Sie ${formatEUR(totalGrossCents)} in bar bei der Zustellung bereit.`,
        "Vorher wird nichts abgebucht. Ein Nachnahmezuschlag kommt nicht dazu.",
      ],
      afterAddress: [`Telefon: ${order.customer.phone}`],
      outro: delivery,
    };
  }
  if (order.status === "bezahlt") {
    return {
      intro: ["Ihre Zahlung ist bei Stripe eingegangen. Dies ist die Bestellbestätigung.", "Kartendaten liegen Iwoody nicht vor."],
      afterAddress: [],
      outro: delivery,
    };
  }
  return {
    intro: [
      "wir haben Ihre Anfrage erhalten.",
      "Das ist keine Bestellung und keine Zahlungsbestätigung. Es wurde kein Betrag abgebucht und der Bestand nicht verringert.",
    ],
    afterAddress: [],
    outro: [],
  };
}

/**
 * The email a buyer gets for an order, as plain text and as HTML in the shop's look.
 * `notice` adds a first line to both, e.g. to mark a test.
 */
export function orderMessage(order: Order, notice?: string): { subject: string; text: string; html: string } {
  const summary = summarize(order.items, order.shippingGrossCents, order.vatRate);
  const parts = messageParts(order, summary.totalGrossCents);
  const name = `${order.customer.firstName} ${order.customer.lastName}`;
  const subject =
    order.status === "bezahlt" || order.status === "nachnahme" ? `Bestellbestätigung ${order.id}` : `Ihre Anfrage ${order.id}`;
  const addressLines = [name, order.customer.street, `${order.customer.zip} ${order.customer.city}`, order.customer.country];
  const totalRows: [string, number][] = [
    ["Warenwert brutto", summary.goodsGrossCents],
    ["darin MwSt.", summary.goodsVatCents],
    [`Versand brutto (${order.shippingLabel})`, summary.shippingGrossCents],
    ["darin MwSt.", summary.shippingVatCents],
  ];

  const text = [
    ...(notice ? [notice, ""] : []),
    `Guten Tag ${name},`,
    "",
    ...parts.intro,
    "",
    `Vorgang: ${order.id}`,
    "",
    order.items
      .map(
        (item) =>
          `${item.qty} × ${item.name} (${item.sku}) à ${formatEUR(item.unitGrossCents)} = ${formatEUR(item.unitGrossCents * item.qty)}`,
      )
      .join("\n"),
    "",
    [...totalRows.map(([label, cents]) => `${label}: ${formatEUR(cents)}`), `Gesamtbetrag: ${formatEUR(summary.totalGrossCents)}`].join(
      "\n",
    ),
    "",
    "Lieferadresse:",
    addressLines.join("\n"),
    ...parts.afterAddress,
    ...(parts.outro.length ? ["", ...parts.outro] : []),
  ].join("\n");

  const html = orderHtml({ order, notice, name, parts, addressLines, totalRows, totalGrossCents: summary.totalGrossCents });
  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Email HTML uses tables and inline styles only, because mail apps drop most CSS. Colours follow tailwind.config.ts.
function orderHtml({
  order,
  notice,
  name,
  parts,
  addressLines,
  totalRows,
  totalGrossCents,
}: {
  order: Order;
  notice?: string;
  name: string;
  parts: MessageParts;
  addressLines: string[];
  totalRows: [string, number][];
  totalGrossCents: number;
}): string {
  const e = escapeHtml;
  const font = "font-family:Helvetica,Arial,sans-serif;";
  const confirmed = order.status === "bezahlt" || order.status === "nachnahme";
  const heading = confirmed ? "Danke für Ihre Bestellung!" : "Ihre Anfrage ist eingegangen";
  const paragraphs = (lines: string[]) =>
    lines.map((line) => `<p style="margin:0 0 10px;${font}font-size:15px;line-height:1.55;color:#3b3654;">${e(line)}</p>`).join("");
  const items = order.items
    .map(
      (item) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #ece9f7;${font}font-size:14px;line-height:1.45;color:#1b1630;"><strong>${item.qty} ×</strong> ${e(item.name)}<br><span style="font-size:12px;color:#8a84a8;">${e(item.sku)} · je ${formatEUR(item.unitGrossCents)}</span></td>
        <td align="right" valign="top" style="padding:12px 0 12px 12px;border-bottom:1px solid #ece9f7;${font}font-size:14px;color:#1b1630;white-space:nowrap;">${formatEUR(item.unitGrossCents * item.qty)}</td>
      </tr>`,
    )
    .join("");
  const totals = totalRows
    .map(
      ([label, cents]) => `<tr>
        <td style="padding:3px 0;${font}font-size:13px;color:#6f6a8c;">${e(label)}</td>
        <td align="right" style="padding:3px 0;${font}font-size:13px;color:#6f6a8c;white-space:nowrap;">${formatEUR(cents)}</td>
      </tr>`,
    )
    .join("");
  const link = (path: string, label: string) => `<a href="${PRODUCTION_URL}${path}" style="color:#c9c4e6;text-decoration:underline;">${label}</a>`;

  return `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(order.id)}</title></head>
<body style="margin:0;padding:0;background:#f3f1fb;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1fb;">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">
    <tr><td align="center" style="background:#0A0716;padding:22px 24px;">
      <a href="${PRODUCTION_URL}"><img src="${PRODUCTION_URL}/email/iwoody-logo.png" width="200" height="50" alt="Iwoody" style="display:block;border:0;"></a>
    </td></tr>
    <tr><td style="height:4px;line-height:4px;font-size:0;background:#A78BFA;background-image:linear-gradient(90deg,#22D3EE,#A78BFA,#FF2BD6);">&nbsp;</td></tr>
    ${notice ? `<tr><td style="padding:16px 28px 0;"><p style="margin:0;padding:10px 14px;border-radius:10px;background:#fff4dc;${font}font-size:13px;color:#7a5200;">${e(notice)}</p></td></tr>` : ""}
    <tr><td style="padding:28px 28px 8px;">
      <h1 style="margin:0 0 6px;${font}font-size:24px;line-height:1.25;color:#1b1630;">${heading}</h1>
      <p style="margin:0 0 18px;${font}font-size:13px;color:#8a84a8;">Vorgang ${e(order.id)}</p>
      <p style="margin:0 0 10px;${font}font-size:15px;line-height:1.55;color:#3b3654;">Guten Tag ${e(name)},</p>
      ${paragraphs(parts.intro)}
    </td></tr>
    <tr><td style="padding:8px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
        ${totals}
        <tr>
          <td style="padding:12px 0 0;${font}font-size:16px;font-weight:bold;color:#1b1630;">Gesamtbetrag</td>
          <td align="right" style="padding:12px 0 0;${font}font-size:18px;font-weight:bold;color:#7C3AED;white-space:nowrap;">${formatEUR(totalGrossCents)}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5fd;border-radius:12px;">
        <tr><td style="padding:16px 18px;">
          <p style="margin:0 0 6px;${font}font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#7C3AED;">Lieferadresse</p>
          <p style="margin:0;${font}font-size:14px;line-height:1.55;color:#1b1630;">${[...addressLines, ...parts.afterAddress].map(e).join("<br>")}</p>
        </td></tr>
      </table>
    </td></tr>
    ${parts.outro.length ? `<tr><td style="padding:20px 28px 0;">${paragraphs(parts.outro)}</td></tr>` : ""}
    <tr><td style="padding:14px 28px 28px;">
      <p style="margin:0;${font}font-size:14px;line-height:1.55;color:#3b3654;">Fragen? Schreiben Sie an <a href="mailto:support@iwoody.de" style="color:#7C3AED;">support@iwoody.de</a>.</p>
    </td></tr>
    <tr><td align="center" style="background:#0A0716;padding:18px 28px;">
      <p style="margin:0 0 6px;${font}font-size:12px;color:#c9c4e6;">Iwoody · Sammelkarten, originalverpackt und versiegelt</p>
      <p style="margin:0;${font}font-size:12px;color:#c9c4e6;">${link("/widerruf", "Widerruf")} · ${link("/agb", "AGB")} · ${link("/datenschutz", "Datenschutz")} · ${link("/impressum", "Impressum")}</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}
