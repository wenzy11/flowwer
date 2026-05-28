"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { updateCompanySettings } from "@/lib/db/quotes";
import { requireUserId } from "@/lib/auth/user";

const settingsSchema = z.object({
  companyName: z.string().min(1).max(200),
  email: z.string().max(200),
  phone: z.string().max(50),
  address: z.string().max(500),
  taxId: z.string().max(50).optional().or(z.literal("")),
  taxOffice: z.string().max(200).optional().or(z.literal("")),
  defaultMarkup: z.coerce.number().min(0).max(1000),
  defaultTax: z.coerce.number().min(0).max(100),
  defaultDepositPercent: z.coerce.number().min(0).max(100),
  currency: z.enum(["USD", "EUR", "GBP", "TRY"]),
  defaultTerms: z.string().max(5000),
  logoUrl: z.string().max(500).optional().or(z.literal("")),
  licenseNumber: z.string().max(200).optional().or(z.literal("")),
  insuranceInfo: z.string().max(500).optional().or(z.literal("")),
});

export async function updateSettingsAction(formData: FormData) {
  const parsed = settingsSchema.safeParse({
    companyName: formData.get("companyName"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    taxId: formData.get("taxId") ?? "",
    taxOffice: formData.get("taxOffice") ?? "",
    defaultMarkup: formData.get("defaultMarkup"),
    defaultTax: formData.get("defaultTax"),
    defaultDepositPercent: formData.get("defaultDepositPercent"),
    currency: formData.get("currency"),
    defaultTerms: formData.get("defaultTerms") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
    licenseNumber: formData.get("licenseNumber") ?? "",
    insuranceInfo: formData.get("insuranceInfo") ?? "",
  });

  if (!parsed.success) {
    return { success: false as const, error: "validation" };
  }

  const userId = await requireUserId();
  await updateCompanySettings({
    companyName: parsed.data.companyName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    address: parsed.data.address,
    taxId: parsed.data.taxId ?? "",
    taxOffice: parsed.data.taxOffice ?? "",
    defaultMarkup: parsed.data.defaultMarkup,
    defaultTax: parsed.data.defaultTax,
    defaultDepositPercent: parsed.data.defaultDepositPercent,
    currency: parsed.data.currency,
    defaultTerms: parsed.data.defaultTerms,
    logoUrl: parsed.data.logoUrl ?? "",
    licenseNumber: parsed.data.licenseNumber ?? "",
    insuranceInfo: parsed.data.insuranceInfo ?? "",
    paymentsEnabled: false,
  }, userId);

  const locale = formData.get("locale")?.toString();
  if (locale) {
    revalidatePath(`/${locale}/settings`);
    revalidatePath(`/${locale}/dashboard`);
    revalidatePath(`/${locale}/quote-builder`);
    revalidatePath(`/${locale}/integrations`);
  }
  return { success: true as const };
}
