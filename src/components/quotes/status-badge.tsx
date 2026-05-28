import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { QuoteStatus } from "@/lib/db/quotes";
import { cn } from "@/lib/utils";

const statusStyles: Record<QuoteStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-500/12 text-blue-700 dark:text-blue-300",
  approved: "bg-primary/12 text-[oklch(0.42_0.12_166)] dark:text-primary",
  declined: "bg-destructive/12 text-destructive",
};

export function StatusBadge({ status }: { status: QuoteStatus }) {
  const t = useTranslations("quotes.status");

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status]
      )}
    >
      {t(status)}
    </Badge>
  );
}
