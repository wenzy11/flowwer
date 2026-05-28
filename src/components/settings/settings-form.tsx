"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateSettingsAction } from "@/lib/actions/settings";
import type { CompanySettings } from "@/lib/db/types";
import { FieldHint } from "@/components/ui/field-hint";
import { InfoBanner } from "@/components/ui/info-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SettingsFormProps = {
  settings: CompanySettings;
  locale: string;
};

export function SettingsForm({ settings, locale }: SettingsFormProps) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);

    startTransition(async () => {
      const result = await updateSettingsAction(formData);
      if (!result.success) {
        setError(true);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InfoBanner title={t("bannerTitle")} description={t("bannerDescription")} />

      <Card id="setup-company">
        <CardHeader>
          <CardTitle>{t("businessProfile")}</CardTitle>
          <CardDescription>{t("businessProfileDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldHint
            htmlFor="companyName"
            label={t("fields.companyName")}
            hint={t("hints.companyName")}
            required
          >
            <Input
              id="companyName"
              name="companyName"
              defaultValue={settings.companyName}
              required
              className="h-11"
            />
          </FieldHint>
        </CardContent>
      </Card>

      <Card id="setup-contact">
        <CardHeader>
          <CardTitle>{t("contactSection")}</CardTitle>
          <CardDescription>{t("contactSectionDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldHint
            htmlFor="email"
            label={t("fields.email")}
            hint={t("hints.email")}
          >
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={settings.email}
              className="h-11"
            />
          </FieldHint>
          <FieldHint
            htmlFor="phone"
            label={t("fields.phone")}
            hint={t("hints.phone")}
          >
            <Input
              id="phone"
              name="phone"
              defaultValue={settings.phone}
              className="h-11"
            />
          </FieldHint>
        </CardContent>
      </Card>

      <Card id="setup-address">
        <CardHeader>
          <CardTitle>{t("addressSection")}</CardTitle>
          <CardDescription>{t("addressSectionDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldHint
            htmlFor="address"
            label={t("fields.address")}
            hint={t("hints.address")}
          >
            <Textarea
              id="address"
              name="address"
              defaultValue={settings.address}
              rows={3}
            />
          </FieldHint>
        </CardContent>
      </Card>

      <Card id="setup-tax">
        <CardHeader>
          <CardTitle>{t("taxSection")}</CardTitle>
          <CardDescription>{t("taxSectionDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldHint
              htmlFor="taxId"
              label={t("fields.taxId")}
              hint={t("hints.taxId")}
            >
              <Input
                id="taxId"
                name="taxId"
                defaultValue={settings.taxId}
                placeholder={t("taxIdPlaceholder")}
                className="h-11"
              />
            </FieldHint>
            <FieldHint
              htmlFor="taxOffice"
              label={t("fields.taxOffice")}
              hint={t("hints.taxOffice")}
            >
              <Input
                id="taxOffice"
                name="taxOffice"
                defaultValue={settings.taxOffice}
                placeholder={t("taxOfficePlaceholder")}
                className="h-11"
              />
            </FieldHint>
          </div>
        </CardContent>
      </Card>

      <Card id="setup-branding">
        <CardHeader>
          <CardTitle>{t("logoBranding")}</CardTitle>
          <CardDescription>{t("logoBrandingDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldHint
            htmlFor="logoUrl"
            label={t("fields.logoUrl")}
            hint={t("hints.logoUrl")}
          >
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              defaultValue={settings.logoUrl}
              placeholder="https://"
              className="h-11"
            />
          </FieldHint>
        </CardContent>
      </Card>

      <Card id="setup-license">
        <CardHeader>
          <CardTitle>{t("licenseSection")}</CardTitle>
          <CardDescription>{t("licenseSectionDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldHint
            htmlFor="licenseNumber"
            label={t("fields.licenseNumber")}
            hint={t("hints.licenseNumber")}
          >
            <Input
              id="licenseNumber"
              name="licenseNumber"
              defaultValue={settings.licenseNumber}
              className="h-11"
            />
          </FieldHint>
          <FieldHint
            htmlFor="insuranceInfo"
            label={t("fields.insuranceInfo")}
            hint={t("hints.insuranceInfo")}
          >
            <Textarea
              id="insuranceInfo"
              name="insuranceInfo"
              defaultValue={settings.insuranceInfo}
              rows={2}
            />
          </FieldHint>
        </CardContent>
      </Card>

      <Card id="setup-defaults">
        <CardHeader>
          <CardTitle>{t("quoteDefaults")}</CardTitle>
          <CardDescription>{t("quoteDefaultsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldHint
            htmlFor="currency"
            label={t("fields.currency")}
            hint={t("hints.currency")}
          >
            <select
              id="currency"
              name="currency"
              defaultValue={settings.currency}
              className="flex h-11 w-full max-w-xs rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="TRY">TRY (₺)</option>
            </select>
          </FieldHint>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldHint
              htmlFor="defaultMarkup"
              label={t("fields.defaultMarkup")}
              hint={t("hints.defaultMarkup")}
            >
              <Input
                id="defaultMarkup"
                name="defaultMarkup"
                type="number"
                min="0"
                step="0.1"
                defaultValue={settings.defaultMarkup}
                className="h-11"
              />
            </FieldHint>
            <FieldHint
              htmlFor="defaultTax"
              label={t("fields.defaultTax")}
              hint={t("hints.defaultTax")}
            >
              <Input
                id="defaultTax"
                name="defaultTax"
                type="number"
                min="0"
                step="0.1"
                defaultValue={settings.defaultTax}
                className="h-11"
              />
            </FieldHint>
            <FieldHint
              htmlFor="defaultDepositPercent"
              label={t("fields.defaultDeposit")}
              hint={t("hints.defaultDeposit")}
            >
              <Input
                id="defaultDepositPercent"
                name="defaultDepositPercent"
                type="number"
                min="0"
                max="100"
                step="1"
                defaultValue={settings.defaultDepositPercent}
                className="h-11"
              />
            </FieldHint>
          </div>
          <FieldHint
            htmlFor="defaultTerms"
            label={t("fields.defaultTerms")}
            hint={t("hints.defaultTerms")}
          >
            <Textarea
              id="defaultTerms"
              name="defaultTerms"
              defaultValue={settings.defaultTerms}
              rows={5}
              placeholder={t("defaultTermsPlaceholder")}
            />
          </FieldHint>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dataExport")}</CardTitle>
          <CardDescription>{t("dataExportDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <a
            href="/api/export?type=estimates"
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            {t("exportEstimates")}
          </a>
          <a
            href="/api/export?type=invoices"
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            {t("exportInvoices")}
          </a>
          <a
            href="/api/export?type=clients"
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            {t("exportClients")}
          </a>
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm text-destructive">{tCommon("error")}</p>
      ) : null}
      {saved ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {t("saved")}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="h-11 w-full sm:w-auto" disabled={pending}>
        {pending ? tCommon("saving") : tCommon("save")}
      </Button>
    </form>
  );
}
