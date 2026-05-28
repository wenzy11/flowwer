"use client";

import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type HelpTipProps = {
  content: string;
  className?: string;
};

export function HelpTip({ content, className }: HelpTipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className ?? ""}`}
        aria-label={content}
      >
        <Info className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
