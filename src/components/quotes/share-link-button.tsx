"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type ShareLinkButtonProps = {
  publicToken: string;
};

export function ShareLinkButton({ publicToken }: ShareLinkButtonProps) {
  const t = useTranslations("quoteDetail");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/${locale}/p/${publicToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-10"
      onClick={copyLink}
    >
      {copied ? (
        <Check data-icon="inline-start" className="text-primary" />
      ) : (
        <Link2 data-icon="inline-start" />
      )}
      {copied ? t("linkCopied") : t("copyClientLink")}
    </Button>
  );
}
