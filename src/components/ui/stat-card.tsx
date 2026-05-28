import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "muted";
  className?: string;
};

const iconVariants = {
  default: "bg-primary/12 text-primary",
  primary: "bg-primary text-primary-foreground shadow-sm",
  muted: "bg-muted text-muted-foreground",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div className={cn("qf-card flex flex-col gap-4 p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            iconVariants[variant]
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
        {hint ? (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
