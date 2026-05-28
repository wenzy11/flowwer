"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";

import { establishServerSession } from "@/lib/auth/session-client";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignupFormProps = {
  locale: string;
};

export function SignupForm({ locale }: SignupFormProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isFirebaseConfigured()) {
    return (
      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {t("firebaseNotConfigured")}
      </p>
    );
  }

  async function finishSignIn() {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("no_user");
    const idToken = await user.getIdToken();
    await establishServerSession(idToken);
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
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "unknown";
      setError(t(`errors.${code}` as "errors.unknown") || t("errors.unknown"));
    } finally {
      setPending(false);
    }
  }

  async function handleGoogleSignup() {
    setError(null);
    setPending(true);
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      await finishSignIn();
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "unknown";
      if (code !== "auth/popup-closed-by-user") {
        setError(t("errors.unknown"));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
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
        disabled={pending}
        onClick={handleGoogleSignup}
      >
        {t("continueWithGoogle")}
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
          disabled={pending}
        >
          {pending ? t("signingUp") : t("signUpWithEmail")}
        </Button>
      </form>
    </div>
  );
}
