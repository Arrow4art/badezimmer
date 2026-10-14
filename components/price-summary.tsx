import { formatEUR, type PriceSummary } from "@/lib/money";

function Row({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-6 ${strong ? "border-t border-ink/10 pt-3 text-base font-medium" : ""}`}>
      <dt>{label}</dt>
      <dd>{formatEUR(value)}</dd>
    </div>
  );
}

export function PriceBreakdown({
  summary,
  shippingLabel,
  vatRate,
}: {
  summary: PriceSummary;
  shippingLabel: string;
  vatRate: number;
}) {
  const percent = Math.round(vatRate * 100);
  return (
    <div>
      <dl className="space-y-2 text-sm">
        <Row label="Warenwert netto" value={summary.goodsNetCents} />
        <Row label={`MwSt. ${percent} % auf Waren`} value={summary.goodsVatCents} />
        <Row label="Warenwert brutto" value={summary.goodsGrossCents} />
        <Row label={`Versand brutto · ${shippingLabel}`} value={summary.shippingGrossCents} />
        <Row label={`MwSt. ${percent} % auf Versand`} value={summary.shippingVatCents} />
        <Row label="Netto gesamt" value={summary.totalNetCents} />
        <Row label="MwSt. gesamt" value={summary.totalVatCents} />
        <Row label="Gesamtbetrag" value={summary.totalGrossCents} strong />
      </dl>
      <p className="mt-3 text-sm text-muted">
        Der Gesamtbetrag enthält die Mehrwertsteuer und den konfigurierten Versand. Weitere Gebühren kommen nicht hinzu.
      </p>
    </div>
  );
}
