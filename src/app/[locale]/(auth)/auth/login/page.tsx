import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/components/auth/login-form";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const t = await getTranslations("auth");

  return (
    <Card className="qf-card-elevated border-0 shadow-none ring-0 md:shadow-[var(--shadow-elevated)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{t("signIn")}</CardTitle>
        <CardDescription>
          {t("signInDescription", { appName: siteConfig.name })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm locale={locale} />
      </CardContent>
      <CardFooter className="justify-center gap-1 border-t border-border/60 pt-6 text-sm text-muted-foreground">
        <span>{t("noAccount")}</span>
        <Link
          href="/auth/signup"
          className="font-semibold text-primary hover:underline"
        >
          {t("createOne")}
        </Link>
      </CardFooter>
    </Card>
  );
}
