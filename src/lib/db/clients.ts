import { v4 as uuidv4 } from "uuid";

import type { ClientInput } from "@/lib/validations";
import { getAdminFirestore } from "@/lib/firebase/admin";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
    address: (row.address as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function clientsCollection(userId: string) {
  return getAdminFirestore().collection("users").doc(userId).collection("clients");
}

export async function listClients(userId: string): Promise<Client[]> {
  const snapshot = await clientsCollection(userId).orderBy("name", "asc").get();
  return snapshot.docs.map((doc) =>
    mapRow({ id: doc.id, ...(doc.data() as Record<string, unknown>) })
  );
}

export async function getClient(id: string, userId: string): Promise<Client | null> {
  const doc = await clientsCollection(userId).doc(id).get();
  if (!doc.exists) return null;
  return mapRow({ id: doc.id, ...(doc.data() as Record<string, unknown>) });
}

export async function createClient(input: ClientInput, userId: string): Promise<Client> {
  const id = uuidv4();
  const now = new Date().toISOString();
  await clientsCollection(userId).doc(id).set({
    name: input.name,
    email: input.email ?? "",
    phone: input.phone ?? "",
    address: input.address ?? "",
    created_at: now,
    updated_at: now,
  });
  return (await getClient(id, userId))!;
}

export async function updateClient(
  id: string,
  input: ClientInput,
  userId: string
): Promise<Client | null> {
  const existing = await getClient(id, userId);
  if (!existing) return null;
  const now = new Date().toISOString();
  await clientsCollection(userId).doc(id).update({
    name: input.name,
    email: input.email ?? "",
    phone: input.phone ?? "",
    address: input.address ?? "",
    updated_at: now,
  });
  return getClient(id, userId);
}

export async function deleteClient(id: string, userId: string): Promise<boolean> {
  const quotes = await getAdminFirestore()
    .collection("users")
    .doc(userId)
    .collection("quotes")
    .where("client_id", "==", id)
    .limit(1)
    .get();
  if (!quotes.empty) return false;
  await clientsCollection(userId).doc(id).delete();
  return true;
}
