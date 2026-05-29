import "server-only";

import { getAdminFirestore } from "@/lib/firebase/admin";

import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  type SubscriptionStatus,
  type UserSubscription,
} from "./types";

function subscriptionDoc(userId: string) {
  return getAdminFirestore()
    .collection("users")
    .doc(userId)
    .collection("billing")
    .doc("subscription");
}

const EMPTY_SUBSCRIPTION: UserSubscription = {
  status: "inactive",
  plan: "pro",
  interval: null,
  polarSubscriptionId: null,
  polarCustomerId: null,
  currentPeriodEnd: null,
  updatedAt: new Date().toISOString(),
};

function mapSubscription(
  data: Record<string, unknown> | undefined
): UserSubscription {
  if (!data) return { ...EMPTY_SUBSCRIPTION };
  return {
    status: (data.status as SubscriptionStatus) ?? "inactive",
    plan: "pro",
    interval: (data.interval as "month" | "year" | null) ?? null,
    polarSubscriptionId: (data.polar_subscription_id as string) ?? null,
    polarCustomerId: (data.polar_customer_id as string) ?? null,
    currentPeriodEnd: (data.current_period_end as string) ?? null,
    updatedAt: (data.updated_at as string) ?? new Date().toISOString(),
  };
}

export async function getUserSubscription(
  userId: string
): Promise<UserSubscription> {
  const snap = await subscriptionDoc(userId).get();
  return mapSubscription(snap.data());
}

export function hasActiveSubscription(subscription: UserSubscription) {
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status);
}

export async function userHasActiveSubscription(userId: string) {
  const sub = await getUserSubscription(userId);
  return hasActiveSubscription(sub);
}

export async function upsertUserSubscription(
  userId: string,
  input: Partial<UserSubscription> & { status: SubscriptionStatus }
) {
  const now = new Date().toISOString();
  await subscriptionDoc(userId).set(
    {
      status: input.status,
      plan: "pro",
      interval: input.interval ?? null,
      polar_subscription_id: input.polarSubscriptionId ?? null,
      polar_customer_id: input.polarCustomerId ?? null,
      current_period_end: input.currentPeriodEnd ?? null,
      updated_at: now,
    },
    { merge: true }
  );
}

export async function deactivateUserSubscription(userId: string) {
  await upsertUserSubscription(userId, { status: "inactive", interval: null });
}
