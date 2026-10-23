import { formatEUR, summarize } from "@/lib/money";
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

export function orderMessage(order: Order): { subject: string; text: string } {
  const summary = summarize(order.items, order.shippingGrossCents, order.vatRate);
  const lines = order.items
    .map(
      (item) =>
        `${item.qty} × ${item.name} (${item.sku}) à ${formatEUR(item.unitGrossCents)} = ${formatEUR(item.unitGrossCents * item.qty)}`,
    )
    .join("\n");
  const address = [
    `${order.customer.firstName} ${order.customer.lastName}`,
    order.customer.street,
    `${order.customer.zip} ${order.customer.city}`,
    order.customer.country,
  ].join("\n");

  const totals = [
    `Warenwert brutto: ${formatEUR(summary.goodsGrossCents)}`,
    `darin MwSt.: ${formatEUR(summary.goodsVatCents)}`,
    `Versand brutto (${order.shippingLabel}): ${formatEUR(summary.shippingGrossCents)}`,
    `darin MwSt.: ${formatEUR(summary.shippingVatCents)}`,
    `Gesamtbetrag: ${formatEUR(summary.totalGrossCents)}`,
  ].join("\n");

  if (order.status === "nachnahme") {
    return {
      subject: `Bestellbestätigung ${order.id}`,
      text: [
        `Guten Tag ${order.customer.firstName} ${order.customer.lastName},`,
        "",
        "Ihre Bestellung ist eingegangen. Sie zahlen per Nachnahme.",
        `Bitte halten Sie ${formatEUR(summary.totalGrossCents)} in bar bei der Zustellung bereit.`,
        "Vorher wird nichts abgebucht. Ein Nachnahmezuschlag kommt nicht dazu.",
        "",
        `Vorgang: ${order.id}`,
        "",
        lines,
        "",
        totals,
        "",
        "Lieferadresse:",
        address,
        `Telefon: ${order.customer.phone}`,
        "",
        "Die Lieferung innerhalb Deutschlands dauert 0–1 Werktage. Die Spedition stimmt den Termin vorher mit Ihnen ab.",
        "Montage und elektrischer Anschluss richten sich nach den Hinweisen im Shop.",
      ].join("\n"),
    };
  }

  if (order.status === "bezahlt") {
    return {
      subject: `Bestellbestätigung ${order.id}`,
      text: [
        `Guten Tag ${order.customer.firstName} ${order.customer.lastName},`,
        "",
        "Ihre Zahlung ist bei Stripe eingegangen. Dies ist die Bestellbestätigung.",
        "Kartendaten liegen Badezimmer nicht vor.",
        "",
        `Vorgang: ${order.id}`,
        "",
        lines,
        "",
        totals,
        "",
        "Lieferadresse:",
        address,
        "",
        "Die Lieferung innerhalb Deutschlands dauert 0–1 Werktage. Die Spedition stimmt den Termin vorher mit Ihnen ab.",
        "Montage und elektrischer Anschluss richten sich nach den Hinweisen im Shop.",
      ].join("\n"),
    };
  }

  return {
    subject: `Ihre Anfrage ${order.id}`,
    text: [
      `Guten Tag ${order.customer.firstName} ${order.customer.lastName},`,
      "",
      "wir haben Ihre Anfrage erhalten.",
      "Das ist keine Bestellung und keine Zahlungsbestätigung. Es wurde kein Betrag abgebucht und der Bestand nicht verringert.",
      "",
      `Vorgang: ${order.id}`,
      "",
      lines,
      "",
      totals,
      "",
      "Lieferadresse:",
      address,
    ].join("\n"),
  };
}
