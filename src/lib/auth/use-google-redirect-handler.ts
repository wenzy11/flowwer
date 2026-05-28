"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { finishClientSignIn } from "@/lib/auth/finish-client-sign-in";
import { completeGoogleRedirectIfNeeded } from "@/lib/auth/google-sign-in";
import { redirectAfterSignIn } from "@/lib/auth/redirect-after-sign-in";
import { resolveAuthError } from "@/lib/auth/resolve-auth-error";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";

type UseGoogleRedirectHandlerOptions = {
  locale: string;
  setPending: (pending: boolean) => void;
  setError: (error: string | null) => void;
};

export function useGoogleRedirectHandler({
  locale,
  setPending,
  setError,
}: UseGoogleRedirectHandlerOptions) {
  const t = useTranslations("auth");
  const processingRef = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured() || processingRef.current) return;

    let active = true;

    (async () => {
      try {
        const auth = getFirebaseAuth();
        const redirectResult = await completeGoogleRedirectIfNeeded(auth);
        if (!redirectResult || !active) return;

        processingRef.current = true;
        setPending(true);
        setError(null);

        await finishClientSignIn(auth, redirectResult.user);
        redirectAfterSignIn(locale);
      } catch (err: unknown) {
        processingRef.current = false;
        if (active) setError(resolveAuthError(err, t));
        if (active) setPending(false);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mount; locale is stable for this page
  }, [locale]);
}
