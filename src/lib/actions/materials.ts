"use server";

import { revalidatePath } from "next/cache";

import {
  createMaterial,
  deleteMaterial,
  updateMaterial,
} from "@/lib/db/materials";
import { requireUserId } from "@/lib/auth/user";
import { materialSchema } from "@/lib/validations";

function revalidateAll(locale?: string) {
  const paths = ["/dashboard", "/materials", "/quote-builder", "/quotes"];
  if (locale) {
    paths.forEach((p) => revalidatePath(`/${locale}${p}`));
  } else {
    paths.forEach((p) => revalidatePath(p, "layout"));
  }
}

export async function createMaterialAction(formData: FormData) {
  const parsed = materialSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    unitCost: formData.get("unitCost"),
  });

  if (!parsed.success) {
    return { success: false as const, error: "validation" };
  }

  const userId = await requireUserId();
  await createMaterial(parsed.data, userId);
  revalidateAll(formData.get("locale")?.toString());
  return { success: true as const };
}

export async function updateMaterialAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return { success: false as const, error: "missing_id" };

  const parsed = materialSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    unitCost: formData.get("unitCost"),
  });

  if (!parsed.success) {
    return { success: false as const, error: "validation" };
  }

  const userId = await requireUserId();
  const updated = await updateMaterial(id, parsed.data, userId);
  if (!updated) return { success: false as const, error: "not_found" };

  revalidateAll(formData.get("locale")?.toString());
  return { success: true as const };
}

export async function deleteMaterialAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return { success: false as const, error: "missing_id" };

  const userId = await requireUserId();
  const deleted = await deleteMaterial(id, userId);
  if (!deleted) return { success: false as const, error: "not_found" };

  revalidateAll(formData.get("locale")?.toString());
  return { success: true as const };
}
