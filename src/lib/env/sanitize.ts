/** Strip whitespace/newlines accidentally pasted into Vercel env values. */
export function sanitizeEnv(value?: string): string | undefined {
  if (value == null) return undefined;
  const cleaned = value.trim().replace(/[\r\n]+/g, "");
  return cleaned.length > 0 ? cleaned : undefined;
}
