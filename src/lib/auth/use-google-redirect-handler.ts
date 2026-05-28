"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { finishClientSignIn } from "@/lib/auth/finish-client-sign-in";
import {
  clearGoogleRedirectPending,
  completeGoogleRedirectIfNeeded,
  wasGoogleRedirectPending,
} from "@/lib/auth/google-sign-in";
import {
  readLoginRedirectTarget,
  redirectAfterSignIn,
} from "@/lib/auth/redirect-after-sign-in";
import { resolveAuthError } from "@/lib/auth/resolve-auth-error";
import { waitForFirebaseUser } from "@/lib/auth/wait-for-firebase-user";
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

    const pendingRedirect = wasGoogleRedirectPending();
    if (!pendingRedirect) return;

    let active = true;

    (async () => {
      try {
        const auth = getFirebaseAuth();
        const redirectResult = await completeGoogleRedirectIfNeeded(auth);
        const user =
          redirectResult?.user ??
          auth.currentUser ??
          (await waitForFirebaseUser(auth, 12000).catch(() => null));

        clearGoogleRedirectPending();

        if (!user || !active) return;

        processingRef.current = true;
        setPending(true);
        setError(null);

        await finishClientSignIn(auth, user);
        redirectAfterSignIn(locale, readLoginRedirectTarget());
      } catch (err: unknown) {
        clearGoogleRedirectPending();
        processingRef.current = false;
        if (active) setError(resolveAuthError(err, t));
        if (active) setPending(false);
      }
    })();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mount
  }, [locale]);
}
