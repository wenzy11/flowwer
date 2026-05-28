"use client";

import type { ReactNode } from "react";

import { HelpTip } from "@/components/ui/help-tip";
import { Label } from "@/components/ui/label";

type FieldHintProps = {
  htmlFor?: string;
  label: string;
  hint?: string;
  required?: boolean;
  children?: ReactNode;
};

export function FieldHint({
  htmlFor,
  label,
  hint,
  required,
  children,
}: FieldHintProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor}>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
        {hint ? <HelpTip content={hint} /> : null}
      </div>
      {children}
    </div>
  );
}
