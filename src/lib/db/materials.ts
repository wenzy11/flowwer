import { v4 as uuidv4 } from "uuid";

import type { MaterialInput } from "@/lib/validations";
import { getAdminFirestore } from "@/lib/firebase/admin";

export type Material = {
  id: string;
  name: string;
  unit: string;
  unitCost: number;
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: Record<string, unknown>): Material {
  return {
    id: row.id as string,
    name: row.name as string,
    unit: row.unit as string,
    unitCost: row.unit_cost as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function materialsCollection(userId: string) {
  return getAdminFirestore().collection("users").doc(userId).collection("materials");
}

export async function listMaterials(userId: string): Promise<Material[]> {
  const snapshot = await materialsCollection(userId).orderBy("name", "asc").get();
  return snapshot.docs.map((doc) =>
    mapRow({ id: doc.id, ...(doc.data() as Record<string, unknown>) })
  );
}

export async function getMaterial(id: string, userId: string): Promise<Material | null> {
  const doc = await materialsCollection(userId).doc(id).get();
  if (!doc.exists) return null;
  return mapRow({ id: doc.id, ...(doc.data() as Record<string, unknown>) });
}

export async function createMaterial(
  input: MaterialInput,
  userId: string
): Promise<Material> {
  const id = uuidv4();
  const now = new Date().toISOString();
  await materialsCollection(userId).doc(id).set({
    name: input.name,
    unit: input.unit,
    unit_cost: input.unitCost,
    created_at: now,
    updated_at: now,
  });
  return (await getMaterial(id, userId))!;
}

export async function updateMaterial(
  id: string,
  input: MaterialInput,
  userId: string
): Promise<Material | null> {
  const existing = await getMaterial(id, userId);
  if (!existing) return null;
  const now = new Date().toISOString();
  await materialsCollection(userId).doc(id).update({
    name: input.name,
    unit: input.unit,
    unit_cost: input.unitCost,
    updated_at: now,
  });
  return getMaterial(id, userId);
}

export async function deleteMaterial(id: string, userId: string): Promise<boolean> {
  await materialsCollection(userId).doc(id).delete();
  return true;
}
