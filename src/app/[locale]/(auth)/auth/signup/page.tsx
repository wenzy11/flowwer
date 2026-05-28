import { getTranslations } from "next-intl/server";

import { SignupForm } from "@/components/auth/signup-form";
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

type SignupPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SignupPage({ params }: SignupPageProps) {
  const { locale } = await params;
  const t = await getTranslations("auth");

  return (
    <Card className="qf-card-elevated border-0 shadow-none ring-0 md:shadow-[var(--shadow-elevated)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{t("signUp")}</CardTitle>
        <CardDescription>
          {t("signUpDescription", { appName: siteConfig.name })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm locale={locale} />
      </CardContent>
      <CardFooter className="justify-center gap-1 border-t border-border/60 pt-6 text-sm text-muted-foreground">
        <span>{t("hasAccount")}</span>
        <Link
          href="/auth/login"
          className="font-semibold text-primary hover:underline"
        >
          {t("signInLink")}
        </Link>
      </CardFooter>
    </Card>
  );
}
