"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { finishClientSignIn } from "@/lib/auth/finish-client-sign-in";
import {
  completeGoogleRedirectIfNeeded,
  signInWithGoogle,
} from "@/lib/auth/google-sign-in";
import { resolveAuthError } from "@/lib/auth/resolve-auth-error";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { useRouter } from "@/i18n/navigation";
import { useAuthHealth } from "@/components/auth/use-auth-health";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignupFormProps = {
  locale: string;
};

export function SignupForm({ locale }: SignupFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const health = useAuthHealth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    let cancelled = false;
    (async () => {
      try {
        const auth = getFirebaseAuth();
        const redirectResult = await completeGoogleRedirectIfNeeded(auth);
        if (!redirectResult || cancelled) return;

        setPending(true);
        setError(null);
        await finishClientSignIn(auth);
        router.push("/dashboard");
        router.refresh();
      } catch (err: unknown) {
        if (!cancelled) setError(resolveAuthError(err, t));
      } finally {
        if (!cancelled) setPending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, t]);

  if (!isFirebaseConfigured()) {
    return (
      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {t("firebaseNotConfigured")}
      </p>
    );
  }

  async function finishSignIn() {
    await finishClientSignIn(getFirebaseAuth());
    router.push("/dashboard");
    router.refresh();
  }

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password
      );
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      await finishSignIn();
    } catch (err: unknown) {
      setError(resolveAuthError(err, t));
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleSignup() {
    setError(null);
    setPending(true);
    try {
      const cred = await signInWithGoogle(getFirebaseAuth());
      if (!cred) return;
      await finishSignIn();
    } catch (err: unknown) {
      setError(resolveAuthError(err, t));
    } finally {
      setPending(false);
    }
  }

  const serverIssue =
    health && !health.ok
      ? health.adminInit === "missing_env" || health.adminInit === "invalid_private_key"
        ? t("errors.adminKeyInvalid")
        : health.adminInit === "fetch_failed"
          ? t("errors.networkFailed")
          : t("errors.adminNotConfigured")
      : null;

  return (
    <div className="space-y-4">
      {serverIssue ? (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          {serverIssue}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full"
        size="lg"
        disabled={pending || Boolean(serverIssue)}
        onClick={handleGoogleSignup}
      >
        {pending ? t("signingUp") : t("continueWithGoogle")}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">{t("or")}</span>
        </div>
      </div>

      <form onSubmit={handleEmailSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11"
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11"
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="h-11"
            autoComplete="new-password"
          />
        </div>
        <Button
          type="submit"
          className="h-11 w-full shadow-sm"
          size="lg"
          disabled={pending || Boolean(serverIssue)}
        >
          {pending ? t("signingUp") : t("signUpWithEmail")}
        </Button>
      </form>
    </div>
  );
}
