import { formatMoney, summarize } from "@/lib/money";
import { formatAddress, PRODUCTION_URL } from "@/lib/site";
import type { Order, OrderStatus } from "@/lib/types";

export const statusLabel: Record<OrderStatus, string> = {
  anfrage: "Request, not paid",
  zahlung_ausstehend: "Payment pending",
  nachnahme: "Cash on delivery",
  bezahlt: "Paid",
  abgelaufen: "Payment window expired",
  storniert: "Canceled",
  fehlgeschlagen: "Payment not started",
};

/** Short alert for the shop owner (Telegram): what was ordered, by whom, and where it goes. */
export function ownerAlert(order: Order, adminUrl: string): string {
  const heading = order.status === "anfrage" ? "New request" : "New order";
  const c = order.customer;
  return [
    `🛒 ${heading} ${order.id}`,
    `${statusLabel[order.status]} · ${formatMoney(order.totalGrossCents, order.currency)}`,
    "",
    ...order.items.map((item) => `${item.qty} × ${item.name}`),
    "",
    `${c.firstName} ${c.lastName}`,
    [c.email, c.phone].filter(Boolean).join(" · "),
    formatAddress(c),
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
  const delivery = ["We'll email you tracking details as soon as your order ships.", "Your items arrive in their original sealed packaging."];
  if (order.status === "nachnahme") {
    return {
      intro: [
        "We received your order. You pay cash on delivery.",
        `Please have ${formatMoney(totalGrossCents, order.currency)} ready at delivery.`,
        "You won't be charged before then.",
      ],
      afterAddress: [`Phone: ${order.customer.phone}`],
      outro: delivery,
    };
  }
  if (order.status === "bezahlt") {
    return {
      intro: ["We received your payment through Stripe. This is your order confirmation.", "Pilands Cards never sees your card details."],
      afterAddress: [],
      outro: delivery,
    };
  }
  return {
    intro: [
      "We received your request.",
      "This isn't an order or a payment confirmation. You have not been charged.",
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
    order.status === "bezahlt" || order.status === "nachnahme" ? `Order confirmation ${order.id}` : `Your request ${order.id}`;
  const c = order.customer;
  const addressLines = [name, c.street, [c.city, [c.state, c.zip].filter(Boolean).join(" ")].filter(Boolean).join(", "), c.country];
  const money = (cents: number) => formatMoney(cents, order.currency);
  const totalRows: [string, number][] = [
    ["Subtotal", summary.goodsGrossCents],
    [`Shipping (${order.shippingLabel})`, summary.shippingGrossCents],
    ...(summary.totalVatCents > 0 ? ([["Included VAT", summary.totalVatCents]] as [string, number][]) : []),
  ];

  const text = [
    ...(notice ? [notice, ""] : []),
    `Hello ${name},`,
    "",
    ...parts.intro,
    "",
    `Order: ${order.id}`,
    "",
    order.items
      .map(
        (item) =>
          `${item.qty} × ${item.name} (${item.sku}) at ${money(item.unitGrossCents)} = ${money(item.unitGrossCents * item.qty)}`,
      )
      .join("\n"),
    "",
    [...totalRows.map(([label, cents]) => `${label}: ${money(cents)}`), `Total: ${money(summary.totalGrossCents)}`].join(
      "\n",
    ),
    "",
    "Shipping address:",
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
  const money = (cents: number) => formatMoney(cents, order.currency);
  const font = "font-family:Helvetica,Arial,sans-serif;";
  const confirmed = order.status === "bezahlt" || order.status === "nachnahme";
  const heading = confirmed ? "Thanks for your order!" : "We received your request";
  const paragraphs = (lines: string[]) =>
    lines.map((line) => `<p style="margin:0 0 10px;${font}font-size:15px;line-height:1.55;color:#3b3654;">${e(line)}</p>`).join("");
  const items = order.items
    .map(
      (item) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #ece9f7;${font}font-size:14px;line-height:1.45;color:#1b1630;"><strong>${item.qty} ×</strong> ${e(item.name)}<br><span style="font-size:12px;color:#8a84a8;">${e(item.sku)} · ${money(item.unitGrossCents)} each</span></td>
        <td align="right" valign="top" style="padding:12px 0 12px 12px;border-bottom:1px solid #ece9f7;${font}font-size:14px;color:#1b1630;white-space:nowrap;">${money(item.unitGrossCents * item.qty)}</td>
      </tr>`,
    )
    .join("");
  const totals = totalRows
    .map(
      ([label, cents]) => `<tr>
        <td style="padding:3px 0;${font}font-size:13px;color:#6f6a8c;">${e(label)}</td>
        <td align="right" style="padding:3px 0;${font}font-size:13px;color:#6f6a8c;white-space:nowrap;">${money(cents)}</td>
      </tr>`,
    )
    .join("");
  const link = (path: string, label: string) => `<a href="${PRODUCTION_URL}${path}" style="color:#c9c4e6;text-decoration:underline;">${label}</a>`;

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(order.id)}</title></head>
<body style="margin:0;padding:0;background:#f3f1fb;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1fb;">
<tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">
    <tr><td align="center" style="background:#0A0716;padding:22px 24px;">
      <a href="${PRODUCTION_URL}"><img src="${PRODUCTION_URL}/email/pilands-cards-logo.png" width="200" height="50" alt="Pilands Cards" style="display:block;border:0;"></a>
    </td></tr>
    <tr><td style="height:4px;line-height:4px;font-size:0;background:#A78BFA;background-image:linear-gradient(90deg,#22D3EE,#A78BFA,#FF2BD6);">&nbsp;</td></tr>
    ${notice ? `<tr><td style="padding:16px 28px 0;"><p style="margin:0;padding:10px 14px;border-radius:10px;background:#fff4dc;${font}font-size:13px;color:#7a5200;">${e(notice)}</p></td></tr>` : ""}
    <tr><td style="padding:28px 28px 8px;">
      <h1 style="margin:0 0 6px;${font}font-size:24px;line-height:1.25;color:#1b1630;">${heading}</h1>
      <p style="margin:0 0 18px;${font}font-size:13px;color:#8a84a8;">Order ${e(order.id)}</p>
      <p style="margin:0 0 10px;${font}font-size:15px;line-height:1.55;color:#3b3654;">Hello ${e(name)},</p>
      ${paragraphs(parts.intro)}
    </td></tr>
    <tr><td style="padding:8px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
        ${totals}
        <tr>
          <td style="padding:12px 0 0;${font}font-size:16px;font-weight:bold;color:#1b1630;">Total</td>
          <td align="right" style="padding:12px 0 0;${font}font-size:18px;font-weight:bold;color:#7C3AED;white-space:nowrap;">${money(totalGrossCents)}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 28px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5fd;border-radius:12px;">
        <tr><td style="padding:16px 18px;">
          <p style="margin:0 0 6px;${font}font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#7C3AED;">Shipping address</p>
          <p style="margin:0;${font}font-size:14px;line-height:1.55;color:#1b1630;">${[...addressLines, ...parts.afterAddress].map(e).join("<br>")}</p>
        </td></tr>
      </table>
    </td></tr>
    ${parts.outro.length ? `<tr><td style="padding:20px 28px 0;">${paragraphs(parts.outro)}</td></tr>` : ""}
    <tr><td style="padding:14px 28px 28px;">
      <p style="margin:0;${font}font-size:14px;line-height:1.55;color:#3b3654;">Questions? Email <a href="mailto:support@iwoody.de" style="color:#7C3AED;">support@iwoody.de</a>.</p>
    </td></tr>
    <tr><td align="center" style="background:#0A0716;padding:18px 28px;">
      <p style="margin:0 0 6px;${font}font-size:12px;color:#c9c4e6;">Pilands Cards · Factory-sealed trading cards</p>
      <p style="margin:0;${font}font-size:12px;color:#c9c4e6;">${link("/returns", "Returns")} · ${link("/terms", "Terms")} · ${link("/privacy", "Privacy")} · ${link("/legal", "Business Info")}</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}
