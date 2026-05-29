export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "past_due"
  | "inactive";

export type UserSubscription = {
  status: SubscriptionStatus;
  plan: "pro";
  interval: "month" | "year" | null;
  polarSubscriptionId: string | null;
  polarCustomerId: string | null;
  currentPeriodEnd: string | null;
  updatedAt: string;
};

export const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "active",
  "trialing",
];
