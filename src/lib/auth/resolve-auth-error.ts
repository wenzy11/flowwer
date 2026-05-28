type AuthTranslator = (
  key: string,
  values?: Record<string, string>
) => string;

const SERVER_ERROR_KEYS: Record<string, string> = {
  "Invalid token": "errors.sessionInvalid",
  "Firebase Admin not configured": "errors.adminNotConfigured",
  session_failed: "errors.sessionFailed",
  Missing: "errors.sessionFailed",
};

export function resolveAuthError(
  err: unknown,
  t: AuthTranslator
): string | null {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code: string }).code);
    if (code === "auth/popup-closed-by-user") return null;
    const message = t(`errors.${code}`);
    if (message !== `errors.${code}`) return message;
  }

  if (err instanceof Error) {
    const mapped = SERVER_ERROR_KEYS[err.message];
    if (mapped) return t(mapped);
  }

  return t("errors.unknown");
}
