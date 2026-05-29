import { Webhooks } from "@polar-sh/nextjs";

import { upsertUserSubscription, deactivateUserSubscription } from "@/lib/billing/subscription";
import type { SubscriptionStatus } from "@/lib/billing/types";

function resolveUserId(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const userId = (metadata as Record<string, unknown>).userId;
  return typeof userId === "string" && userId.length > 0 ? userId : null;
}

function mapPolarStatus(status: string | undefined): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "canceled":
      return "canceled";
    case "past_due":
      return "past_due";
    default:
      return "inactive";
  }
}

function intervalFromSubscription(data: {
  recurringInterval?: string | null;
  metadata?: unknown;
}): "month" | "year" | null {
  const meta = data.metadata as Record<string, unknown> | undefined;
  if (meta?.interval === "year" || meta?.interval === "month") {
    return meta.interval;
  }
  if (data.recurringInterval === "year") return "year";
  if (data.recurringInterval === "month") return "month";
  return null;
}

async function syncSubscription(data: {
  id: string;
  status: string;
  customerId?: string | null;
  currentPeriodEnd?: Date | string | null;
  metadata?: unknown;
  recurringInterval?: string | null;
}) {
  const userId = resolveUserId(data.metadata);
  if (!userId) {
    console.warn("[polar/webhook] subscription without userId metadata", data.id);
    return;
  }

  const periodEnd = data.currentPeriodEnd
    ? new Date(data.currentPeriodEnd).toISOString()
    : null;

  await upsertUserSubscription(userId, {
    status: mapPolarStatus(data.status),
    interval: intervalFromSubscription(data),
    polarSubscriptionId: data.id,
    polarCustomerId: data.customerId ?? null,
    currentPeriodEnd: periodEnd,
  });
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onSubscriptionActive: async (payload) => {
    await syncSubscription(payload.data);
  },
  onSubscriptionUpdated: async (payload) => {
    await syncSubscription(payload.data);
  },
  onSubscriptionCanceled: async (payload) => {
    await syncSubscription(payload.data);
  },
  onSubscriptionRevoked: async (payload) => {
    const userId = resolveUserId(payload.data.metadata);
    if (userId) await deactivateUserSubscription(userId);
  },
  onOrderPaid: async (payload) => {
    const sub = payload.data.subscription;
    if (sub) await syncSubscription(sub);
  },
});
