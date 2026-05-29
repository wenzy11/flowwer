import "server-only";

import { getCompanySettings, getDashboardStats, listEstimates } from "@/lib/db/quotes";
import { getSetupProgress } from "@/lib/onboarding/setup-tasks";

import { hasActiveSubscription, getUserSubscription } from "./subscription";

/** Routes allowed while onboarding (before Pro payment). */
export const ONBOARDING_PATHS = [
  "/dashboard",
  "/settings",
  "/materials",
  "/clients",
  "/quote-builder",
] as const;

export const BILLING_PATHS = ["/subscribe", "/billing/success"] as const;

export function normalizeAppPath(path: string) {
  const clean = path.split("?")[0] ?? path;
  if (clean.length > 1 && clean.endsWith("/")) return clean.slice(0, -1);
  return clean || "/";
}

export function isOnboardingPath(path: string) {
  const normalized = normalizeAppPath(path);
  return ONBOARDING_PATHS.some(
    (p) => normalized === p || normalized.startsWith(`${p}/`)
  );
}

export function isBillingPath(path: string) {
  const normalized = normalizeAppPath(path);
  return BILLING_PATHS.some(
    (p) => normalized === p || normalized.startsWith(`${p}/`)
  );
}

export async function getOnboardingComplete(userId: string) {
  const [settings, stats, estimates] = await Promise.all([
    getCompanySettings(userId),
    getDashboardStats(userId),
    listEstimates(userId),
  ]);
  const progress = getSetupProgress({
    settings,
    materialsCount: stats.materialsCount,
    clientsCount: stats.clientsCount,
    estimatesCount: estimates.length,
  });
  return progress.isComplete;
}

export type AppAccessResult = {
  hasPro: boolean;
  onboardingComplete: boolean;
  requiresSubscribe: boolean;
  subscribePath: string;
};

export async function resolveAppAccess(
  userId: string,
  path: string,
  locale: string
): Promise<AppAccessResult> {
  const subscription = await getUserSubscription(userId);
  const hasPro = hasActiveSubscription(subscription);
  const onboardingComplete = await getOnboardingComplete(userId);
  const normalized = normalizeAppPath(path);
  const subscribePath = `/${locale}/subscribe`;

  if (hasPro) {
    return {
      hasPro: true,
      onboardingComplete,
      requiresSubscribe: false,
      subscribePath,
    };
  }

  if (!onboardingComplete) {
    const allowed = isOnboardingPath(normalized) || isBillingPath(normalized);
    return {
      hasPro: false,
      onboardingComplete: false,
      requiresSubscribe: !allowed,
      subscribePath,
    };
  }

  return {
    hasPro: false,
    onboardingComplete: true,
    requiresSubscribe: !isBillingPath(normalized),
    subscribePath,
  };
}
