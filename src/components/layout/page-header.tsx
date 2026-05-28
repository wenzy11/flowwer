import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 sm:pt-0.5">{action}</div> : null}
    </div>
  );
}
