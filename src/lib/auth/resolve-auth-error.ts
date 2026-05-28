type AuthTranslator = (
  key: string,
  values?: Record<string, string>
) => string;

const SERVER_ERROR_KEYS: Record<string, string> = {
  admin_not_configured: "errors.adminNotConfigured",
  admin_key_invalid: "errors.adminKeyInvalid",
  invalid_token: "errors.sessionInvalid",
  missing_id_token: "errors.sessionFailed",
  session_failed: "errors.sessionFailed",
  no_user: "errors.sessionFailed",
};

const FIREBASE_ERROR_KEYS: Record<string, string> = {
  "auth/invalid-credential": "errors.invalidCredential",
  "auth/email-already-in-use": "errors.emailAlreadyInUse",
  "auth/weak-password": "errors.weakPassword",
  "auth/too-many-requests": "errors.tooManyRequests",
  "auth/unauthorized-domain": "errors.unauthorizedDomain",
  "auth/popup-blocked": "errors.popupBlocked",
  "auth/operation-not-allowed": "errors.operationNotAllowed",
  "auth/internal-error": "errors.sessionFailed",
  "auth/network-request-failed": "errors.networkFailed",
  "auth/cancelled-popup-request": "errors.popupBlocked",
  "auth/account-exists-with-different-credential": "errors.invalidCredential",
  "auth/user-disabled": "errors.invalidCredential",
};

export function resolveAuthError(
  err: unknown,
  t: AuthTranslator
): string | null {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code: string }).code);
    if (code === "auth/popup-closed-by-user") return null;
    const key = FIREBASE_ERROR_KEYS[code];
    if (key) return t(key);
  }

  if (err instanceof Error) {
    const mapped = SERVER_ERROR_KEYS[err.message];
    if (mapped) return t(mapped);
  }

  return t("errors.unknown");
}
