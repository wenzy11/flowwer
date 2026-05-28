import {
  BarChart3,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Link2,
  Package,
  Plus,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItemKey =
  | "dashboard"
  | "estimates"
  | "invoices"
  | "clients"
  | "items"
  | "newEstimate"
  | "reports"
  | "integrations"
  | "settings";

export type NavItemConfig = {
  key: NavItemKey;
  href:
    | "/dashboard"
    | "/quotes"
    | "/invoices"
    | "/materials"
    | "/clients"
    | "/quote-builder"
    | "/reports"
    | "/integrations"
    | "/settings";
  icon: LucideIcon;
  mobile?: boolean;
};

export const mainNavItems: NavItemConfig[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard, mobile: true },
  { key: "estimates", href: "/quotes", icon: ClipboardList, mobile: true },
  { key: "invoices", href: "/invoices", icon: Receipt, mobile: true },
  { key: "clients", href: "/clients", icon: Users, mobile: true },
  { key: "items", href: "/materials", icon: Package, mobile: false },
];

export const secondaryNavItems: NavItemConfig[] = [
  { key: "reports", href: "/reports", icon: BarChart3 },
  { key: "integrations", href: "/integrations", icon: Link2 },
  { key: "settings", href: "/settings", icon: Settings },
];

export const mobileNavItems: NavItemConfig[] = [
  mainNavItems[0]!,
  mainNavItems[1]!,
  {
    key: "newEstimate",
    href: "/quote-builder",
    icon: Plus,
    mobile: true,
  },
  mainNavItems[2]!,
  mainNavItems[4]!,
];
