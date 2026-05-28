"use client";

import {
  mainNavItems,
  mobileNavItems,
  secondaryNavItems,
} from "@/config/navigation";
import { NavLink } from "@/components/layout/nav-link";

type MainNavProps = {
  variant: "sidebar" | "mobile";
};

export function MainNav({ variant }: MainNavProps) {
  if (variant === "mobile") {
    return (
      <>
        {mobileNavItems.map((item) => (
          <NavLink key={item.href} item={item} variant="mobile" />
        ))}
      </>
    );
  }

  return (
    <>
      {mainNavItems.map((item) => (
        <NavLink key={item.href} item={item} variant="sidebar" />
      ))}
      <div className="my-2 border-t border-sidebar-border" />
      {secondaryNavItems.map((item) => (
        <NavLink key={item.href} item={item} variant="sidebar" />
      ))}
    </>
  );
}
