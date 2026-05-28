import type { CompanySettings } from "@/lib/db/types";

export type SetupTaskId =
  | "company"
  | "contact"
  | "address"
  | "tax"
  | "quoteDefaults"
  | "items"
  | "clients"
  | "firstEstimate"
  | "logo"
  | "license";

export type SetupTaskDef = {
  id: SetupTaskId;
  optional?: boolean;
  href:
    | "/settings"
    | "/materials"
    | "/clients"
    | "/quote-builder";
  settingsHash?: string;
};

export const SETUP_TASK_ORDER: SetupTaskDef[] = [
  { id: "company", href: "/settings", settingsHash: "setup-company" },
  { id: "contact", href: "/settings", settingsHash: "setup-contact" },
  { id: "address", href: "/settings", settingsHash: "setup-address" },
  { id: "tax", href: "/settings", settingsHash: "setup-tax" },
  { id: "quoteDefaults", href: "/settings", settingsHash: "setup-defaults" },
  { id: "items", href: "/materials" },
  { id: "clients", href: "/clients" },
  { id: "firstEstimate", href: "/quote-builder" },
  { id: "logo", href: "/settings", settingsHash: "setup-branding", optional: true },
  {
    id: "license",
    href: "/settings",
    settingsHash: "setup-license",
    optional: true,
  },
];

const DEFAULT_COMPANY_NAMES = ["QuoteFlow", "quoteflow"];

function hasText(value: string, min = 1) {
  return value.trim().length >= min;
}

export type SetupProgressInput = {
  settings: CompanySettings;
  materialsCount: number;
  clientsCount: number;
  estimatesCount: number;
};

export function getSetupTaskStatus(
  id: SetupTaskId,
  input: SetupProgressInput
): boolean {
  const { settings, materialsCount, clientsCount, estimatesCount } = input;
  const name = settings.companyName.trim();

  switch (id) {
    case "company":
      return (
        hasText(name, 2) &&
        !DEFAULT_COMPANY_NAMES.includes(name.toLowerCase())
      );
    case "contact":
      return hasText(settings.email) || hasText(settings.phone, 5);
    case "address":
      return hasText(settings.address, 10);
    case "tax":
      return hasText(settings.taxId, 5);
    case "quoteDefaults":
      return (
        settings.defaultMarkup !== 20 ||
        settings.defaultTax > 0 ||
        settings.currency !== "USD" ||
        hasText(settings.defaultTerms, 10)
      );
    case "items":
      return materialsCount > 0;
    case "clients":
      return clientsCount > 0;
    case "firstEstimate":
      return estimatesCount > 0;
    case "logo":
      return hasText(settings.logoUrl, 8);
    case "license":
      return (
        hasText(settings.licenseNumber, 3) ||
        hasText(settings.insuranceInfo, 5)
      );
    default:
      return false;
  }
}

export function getSetupProgress(input: SetupProgressInput) {
  const tasks = SETUP_TASK_ORDER.map((def) => ({
    ...def,
    done: getSetupTaskStatus(def.id, input),
  }));

  const required = tasks.filter((t) => !t.optional);
  const optional = tasks.filter((t) => t.optional);
  const requiredDone = required.filter((t) => t.done).length;
  const nextTask = required.find((t) => !t.done) ?? optional.find((t) => !t.done);

  return {
    tasks,
    required,
    optional,
    requiredDone,
    requiredTotal: required.length,
    isComplete: requiredDone === required.length,
    percent: Math.round((requiredDone / required.length) * 100),
    nextTask,
  };
}
