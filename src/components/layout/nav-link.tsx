"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { NavItemConfig } from "@/config/navigation";

type NavLinkProps = {
  item: NavItemConfig;
  variant?: "sidebar" | "mobile";
};

export function NavLink({ item, variant = "sidebar" }: NavLinkProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;
  const title = t(item.key);
  const isNewQuote =
    item.href === "/quote-builder" || item.key === "newEstimate";

  if (variant === "mobile") {
    if (isNewQuote) {
      return (
        <Link
          href={item.href}
          className="relative -mt-5 flex min-w-[4.5rem] flex-1 flex-col items-center justify-center px-2"
          aria-label={title}
        >
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-2xl shadow-md transition-transform active:scale-95",
              isActive
                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                : "bg-primary text-primary-foreground"
            )}
          >
            <Icon className="size-6" strokeWidth={2.25} aria-hidden />
          </span>
          <span
            className={cn(
              "mt-1 max-w-full truncate text-[0.625rem] font-semibold",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            {title}
          </span>
        </Link>
      );
    }

    return (
      <Link
        href={item.href}
        className={cn(
          "flex min-h-[3.25rem] min-w-[3.5rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-[0.625rem] font-medium transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl transition-colors",
            isActive && "bg-primary/12"
          )}
        >
          <Icon
            className={cn("size-5", isActive && "stroke-[2.5]")}
            aria-hidden
          />
        </span>
        <span className="max-w-full truncate">{title}</span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/75 hover:bg-muted hover:text-sidebar-foreground"
      )}
    >
      <Icon
        className={cn(
          "size-5 shrink-0",
          isActive ? "text-primary" : "opacity-70"
        )}
        aria-hidden
      />
      <span>{title}</span>
    </Link>
  );
}
