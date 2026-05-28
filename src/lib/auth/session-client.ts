"use client";

export async function establishServerSession(idToken: string) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
    credentials: "same-origin",
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "session_failed");
  }
}

export async function clearServerSession() {
  await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
}
