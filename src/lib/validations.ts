import { z } from "zod";

export const materialSchema = z.object({
  name: z.string().min(1).max(200),
  unit: z.string().min(1).max(50),
  unitCost: z.coerce.number().min(0),
});

export const clientSchema = z.object({
  name: z.string().min(1).max(200),
  email: z
    .string()
    .max(200)
    .refine((v) => v === "" || z.email().safeParse(v).success),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
});

export const quoteLineItemSchema = z.object({
  materialId: z.string().optional(),
  name: z.string().min(1).max(200),
  unit: z.string().min(1).max(50),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().min(0),
});

export const quoteDraftSchema = z.object({
  clientId: z.string().min(1),
  markupPercent: z.coerce.number().min(0).max(1000),
  taxPercent: z.coerce.number().min(0).max(100),
  depositPercent: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().max(5000).optional().or(z.literal("")),
  personalMessage: z.string().max(2000).optional().or(z.literal("")),
  validUntil: z.string().optional().or(z.literal("")),
  lineItems: z.array(quoteLineItemSchema).min(1),
});

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive(),
});

export type MaterialInput = z.infer<typeof materialSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type QuoteLineItemInput = z.infer<typeof quoteLineItemSchema>;
export type QuoteDraftInput = z.infer<typeof quoteDraftSchema>;
