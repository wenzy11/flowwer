import {
  BarChart3,
  ClipboardList,
  FileText,
  Link2,
  Receipt,
  Users,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const features = [
  {
    key: "estimates" as const,
    href: "/quotes",
    icon: ClipboardList,
    color: "bg-primary/12 text-primary",
  },
  {
    key: "invoices" as const,
    href: "/invoices",
    icon: Receipt,
    color: "bg-blue-500/12 text-blue-700",
  },
  {
    key: "clients" as const,
    href: "/clients",
    icon: Users,
    color: "bg-violet-500/12 text-violet-700",
  },
  {
    key: "financing" as const,
    href: "/integrations#financing",
    icon: FileText,
    color: "bg-amber-500/12 text-amber-800",
  },
  {
    key: "quickbooks" as const,
    href: "/integrations#quickbooks",
    icon: Link2,
    color: "bg-slate-500/12 text-slate-700",
  },
  {
    key: "reports" as const,
    href: "/reports",
    icon: BarChart3,
    color: "bg-rose-500/12 text-rose-700",
  },
];

export async function FeatureGrid() {
  const t = await getTranslations("features");

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">{t("title")}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.key}
              href={feature.href}
              className="qf-card group flex gap-4 p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  feature.color
                )}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-semibold group-hover:text-primary">
                  {t(`${feature.key}.title`)}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {t(`${feature.key}.description`)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
