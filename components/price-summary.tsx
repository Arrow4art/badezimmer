import { formatMoney, type PriceSummary } from "@/lib/money";

function Row({ label, value, currency, strong = false }: { label: string; value: number; currency?: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-6 ${strong ? "border-t border-ink/10 pt-3 text-base font-medium" : ""}`}>
      <dt>{label}</dt>
      <dd>{formatMoney(value, currency)}</dd>
    </div>
  );
}

export function PriceBreakdown({
  summary,
  shippingLabel,
  vatRate,
  currency,
}: {
  summary: PriceSummary;
  shippingLabel: string;
  vatRate: number;
  /** Leave out only for orders from before the US switch, which are in EUR. */
  currency?: string;
}) {
  const percent = Math.round(vatRate * 100);
  return (
    <div>
      <dl className="space-y-2 text-sm">
        <Row label="Subtotal" value={summary.goodsGrossCents} currency={currency} />
        <Row label={`Shipping · ${shippingLabel}`} value={summary.shippingGrossCents} currency={currency} />
        {percent > 0 ? <Row label={`Included VAT (${percent}%)`} value={summary.totalVatCents} currency={currency} /> : null}
        <Row label="Total" value={summary.totalGrossCents} currency={currency} strong />
      </dl>
      <p className="mt-3 text-sm text-muted">
        The total is the amount you pay. No other fees are added.
      </p>
    </div>
  );
}
