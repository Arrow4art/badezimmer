export function formatEUR(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatShipping(cents: number): string {
  return cents === 0 ? "kostenlos" : formatEUR(cents);
}

export function vatFromGross(grossCents: number, vatRate = 0.19): number {
  const percent = Math.round(vatRate * 100);
  return Math.round((grossCents * percent) / (100 + percent));
}

export type PriceSummary = {
  goodsNetCents: number;
  goodsVatCents: number;
  goodsGrossCents: number;
  shippingNetCents: number;
  shippingVatCents: number;
  shippingGrossCents: number;
  totalNetCents: number;
  totalVatCents: number;
  totalGrossCents: number;
};

export function summarize(
  items: { unitGrossCents: number; qty: number }[],
  shippingGrossCents: number,
  vatRate = 0.19,
): PriceSummary {
  const goodsGrossCents = items.reduce((sum, item) => sum + item.unitGrossCents * item.qty, 0);
  const goodsVatCents = vatFromGross(goodsGrossCents, vatRate);
  const shippingVatCents = vatFromGross(shippingGrossCents, vatRate);
  const goodsNetCents = goodsGrossCents - goodsVatCents;
  const shippingNetCents = shippingGrossCents - shippingVatCents;
  return {
    goodsNetCents,
    goodsVatCents,
    goodsGrossCents,
    shippingNetCents,
    shippingVatCents,
    shippingGrossCents,
    totalNetCents: goodsNetCents + shippingNetCents,
    totalVatCents: goodsVatCents + shippingVatCents,
    totalGrossCents: goodsGrossCents + shippingGrossCents,
  };
}

export function eurosToCents(value: number): number {
  return Math.round(value * 100);
}
