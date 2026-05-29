export const PRO_PLAN = {
  id: "pro" as const,
  monthly: {
    amount: 14.99,
    currency: "USD",
    label: "$14.99",
    interval: "month" as const,
  },
  yearly: {
    amount: 99.99,
    currency: "USD",
    label: "$99.99",
    interval: "year" as const,
    savingsPercent: 44,
  },
};

export type BillingInterval = "month" | "year";

export function getPolarProductId(interval: BillingInterval): string | undefined {
  return interval === "month"
    ? process.env.POLAR_PRODUCT_MONTHLY_ID?.trim()
    : process.env.POLAR_PRODUCT_YEARLY_ID?.trim();
}

export function isPolarConfigured() {
  return Boolean(
    process.env.POLAR_ACCESS_TOKEN?.trim() &&
      process.env.POLAR_WEBHOOK_SECRET?.trim() &&
      process.env.POLAR_PRODUCT_MONTHLY_ID?.trim() &&
      process.env.POLAR_PRODUCT_YEARLY_ID?.trim()
  );
}
