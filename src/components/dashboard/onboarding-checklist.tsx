import { CheckCircle2, Circle, ListChecks, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  getSetupProgress,
  type SetupTaskId,
} from "@/lib/onboarding/setup-tasks";
import type { CompanySettings } from "@/lib/db/types";
import { cn } from "@/lib/utils";

type OnboardingChecklistProps = {
  settings: CompanySettings;
  materialsCount: number;
  clientsCount: number;
  estimatesCount: number;
};

function taskHref(
  href: "/settings" | "/materials" | "/clients" | "/quote-builder",
  hash?: string
) {
  if (hash) return `${href}#${hash}` as const;
  return href;
}

export async function OnboardingChecklist({
  settings,
  materialsCount,
  clientsCount,
  estimatesCount,
}: OnboardingChecklistProps) {
  const t = await getTranslations("dashboard.setup");
  const progress = getSetupProgress({
    settings,
    materialsCount,
    clientsCount,
    estimatesCount,
  });

  if (progress.isComplete) {
    return (
      <section className="qf-card-elevated flex flex-col gap-4 border-primary/25 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <Sparkles className="size-8 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="text-base font-semibold">{t("allDoneTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("allDoneDescription")}
            </p>
          </div>
        </div>
        <Link
          href="/subscribe"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 shrink-0 shadow-sm"
          )}
        >
          {t("unlockPro")}
        </Link>
      </section>
    );
  }

  const taskLabel = (id: SetupTaskId) => ({
    title: t(`tasks.${id}.title`),
    description: t(`tasks.${id}.description`),
    tip: t(`tasks.${id}.tip`),
    action: t(`tasks.${id}.action`),
  });

  let stepIndex = 0;

  return (
    <section className="qf-card-elevated overflow-hidden border-primary/20">
      <div className="border-b border-border/60 bg-primary/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <ListChecks className="size-6 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">{t("title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {t("progress", {
                done: progress.requiredDone,
                total: progress.requiredTotal,
                percent: progress.percent,
              })}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-3">
        {progress.required.map((task) => {
          stepIndex += 1;
          const labels = taskLabel(task.id);
          const isCurrent = progress.nextTask?.id === task.id;
          const link = taskHref(task.href, task.settingsHash);

          return (
            <div
              key={task.id}
              className={cn(
                "flex gap-3 rounded-xl border bg-background p-4 transition-colors",
                isCurrent
                  ? "border-primary/50 ring-1 ring-primary/20"
                  : "border-border/70",
                task.done && "opacity-80"
              )}
            >
              <div className="flex shrink-0 flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-bold",
                    task.done
                      ? "bg-primary/15 text-primary"
                      : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {task.done ? (
                    <CheckCircle2 className="size-4" aria-hidden />
                  ) : (
                    stepIndex
                  )}
                </span>
                {!task.done ? (
                  <Circle
                    className="size-4 text-muted-foreground/40"
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{labels.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {labels.description}
                </p>
                <p className="mt-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {t("tipLabel")}:{" "}
                  </span>
                  {labels.tip}
                </p>
                {!task.done ? (
                  <Link
                    href={link}
                    className={cn(
                      buttonVariants({
                        variant: isCurrent ? "default" : "outline",
                        size: "sm",
                      }),
                      "mt-3 h-9"
                    )}
                  >
                    {labels.action}
                  </Link>
                ) : (
                  <p className="mt-2 text-xs font-medium text-primary">
                    {t("completed")}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {progress.optional.some((t) => !t.done) ? (
          <div className="px-1 pt-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("optionalSection")}
            </p>
          </div>
        ) : null}

        {progress.optional.map((task) => {
          if (task.done) return null;
          const labels = taskLabel(task.id);
          const link = taskHref(task.href, task.settingsHash);

          return (
            <div
              key={task.id}
              className="flex gap-3 rounded-xl border border-dashed border-border/70 bg-background/80 p-4"
            >
              <Circle className="size-5 shrink-0 text-muted-foreground/50" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {labels.title}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({t("optionalBadge")})
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {labels.description}
                </p>
                <Link
                  href={link}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "mt-2 h-8"
                  )}
                >
                  {labels.action}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
