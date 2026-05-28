export type CompanySettings = {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  taxOffice: string;
  defaultMarkup: number;
  defaultTax: number;
  currency: string;
  defaultTerms: string;
  logoUrl: string;
  licenseNumber: string;
  insuranceInfo: string;
  defaultDepositPercent: number;
  paymentsEnabled: boolean;
};

export type CompanySettingsInput = CompanySettings;
