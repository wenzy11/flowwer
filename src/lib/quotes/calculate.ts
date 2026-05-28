export type QuoteTotalsInput = {
  lineTotals: number[];
  markupPercent: number;
  taxPercent: number;
};

export type QuoteTotals = {
  subtotal: number;
  markupAmount: number;
  taxAmount: number;
  total: number;
};

export function calculateLineTotal(quantity: number, unitCost: number): number {
  return roundMoney(quantity * unitCost);
}

export function calculateQuoteTotals(input: QuoteTotalsInput): QuoteTotals {
  const subtotal = roundMoney(
    input.lineTotals.reduce((sum, value) => sum + value, 0)
  );
  const markupAmount = roundMoney(subtotal * (input.markupPercent / 100));
  const afterMarkup = subtotal + markupAmount;
  const taxAmount = roundMoney(afterMarkup * (input.taxPercent / 100));
  const total = roundMoney(afterMarkup + taxAmount);

  return { subtotal, markupAmount, taxAmount, total };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatMoney(
  value: number,
  locale: string,
  currency = "USD"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
