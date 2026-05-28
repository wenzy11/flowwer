import { getTranslations } from "next-intl/server";

export async function StatusGuide() {
  const t = await getTranslations("dashboard.statusGuide");

  const items = ["draft", "sent", "approved", "declined"] as const;

  const dotColors: Record<(typeof items)[number], string> = {
    draft: "bg-muted-foreground",
    sent: "bg-blue-500",
    approved: "bg-primary",
    declined: "bg-destructive",
  };

  return (
    <section className="qf-card overflow-hidden">
      <div className="border-b border-border/70 px-5 py-4">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <div className="grid gap-2 p-4 sm:grid-cols-2">
        {items.map((status) => (
          <div
            key={status}
            className="flex gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5"
          >
            <span
              className={`mt-1.5 size-2 shrink-0 rounded-full ${dotColors[status]}`}
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold">{t(`${status}.label`)}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t(`${status}.hint`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
