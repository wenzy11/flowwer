"use server";

import { revalidatePath } from "next/cache";

import { respondToEstimateByToken } from "@/lib/db/quotes";

export async function clientRespondAction(
  token: string,
  decision: "approved" | "declined",
  locale: string
) {
  const updated = await respondToEstimateByToken(token, decision);
  if (!updated) {
    return { success: false as const, error: "invalid" };
  }
  revalidatePath(`/${locale}/p/${token}`);
  revalidatePath(`/${locale}/quotes`, "layout");
  revalidatePath(`/${locale}/dashboard`);
  return { success: true as const, status: updated.status };
}
