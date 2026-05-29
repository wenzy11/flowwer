import "server-only";

import { Polar } from "@polar-sh/sdk";

export function getPolarServer(): "sandbox" | "production" {
  const raw = process.env.POLAR_SERVER?.trim();
  return raw === "sandbox" ? "sandbox" : "production";
}

export function getPolarClient() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not configured");
  }
  return new Polar({
    accessToken,
    server: getPolarServer(),
  });
}

export function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    return process.env.NEXT_PUBLIC_APP_URL.trim().replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }
  return "http://localhost:3000";
}
