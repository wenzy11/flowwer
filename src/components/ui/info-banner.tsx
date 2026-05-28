"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type InfoBannerProps = {
  title: string;
  description: string;
  variant?: "default" | "hero";
  className?: string;
};

export function InfoBanner({
  title,
  description,
  variant = "default",
  className,
}: InfoBannerProps) {
  if (variant === "hero") {
    return (
      <div
        className={cn(
          "qf-card-elevated relative overflow-hidden rounded-2xl border-primary/15 p-6 sm:p-8",
          className
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 qf-hero-gradient"
          aria-hidden
        />
        <div className="relative flex gap-4">
          <div className="qf-icon-badge size-12 rounded-2xl">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1.5">
            <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5",
        className
      )}
    >
      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
