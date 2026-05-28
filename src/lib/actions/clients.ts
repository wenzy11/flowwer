"use server";

import { revalidatePath } from "next/cache";

import { createClient, deleteClient, updateClient } from "@/lib/db/clients";
import { requireUserId } from "@/lib/auth/user";
import type { ActionError, ActionSuccess, CreateClientSuccess } from "@/lib/actions/types";
import { clientSchema } from "@/lib/validations";

function revalidateAll(locale?: string) {
  const paths = ["/dashboard", "/clients", "/quote-builder", "/quotes"];
  if (locale) {
    paths.forEach((p) => revalidatePath(`/${locale}${p}`));
  } else {
    paths.forEach((p) => revalidatePath(p, "layout"));
  }
}

export async function createClientAction(
  formData: FormData
): Promise<CreateClientSuccess | ActionError> {
  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    address: formData.get("address") || "",
  });

  if (!parsed.success) {
    return { success: false, error: "validation" };
  }

  const userId = await requireUserId();
  const client = await createClient(parsed.data, userId);
  revalidateAll(formData.get("locale")?.toString());
  return { success: true, clientId: client.id };
}

export async function updateClientAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return { success: false as const, error: "missing_id" };

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    address: formData.get("address") || "",
  });

  if (!parsed.success) {
    return { success: false as const, error: "validation" };
  }

  const userId = await requireUserId();
  const updated = await updateClient(id, parsed.data, userId);
  if (!updated) return { success: false as const, error: "not_found" };

  revalidateAll(formData.get("locale")?.toString());
  return { success: true as const };
}

export async function deleteClientAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return { success: false as const, error: "missing_id" };

  const userId = await requireUserId();
  const deleted = await deleteClient(id, userId);
  if (!deleted) {
    return { success: false as const, error: "has_quotes" };
  }

  revalidateAll(formData.get("locale")?.toString());
  return { success: true as const };
}
