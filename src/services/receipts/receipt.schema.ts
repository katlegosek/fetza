import { z } from "zod";

import { IsoDateTimeSchema } from "@/services/assignments/assignment.schema";

export const ReceiptStatusSchema = z.enum([
  "draft",
  "processing",
  "ready",
  "failed",
  "confirmed",
]);

export const ReceiptAdjustmentKindSchema = z.enum([
  "subtotal",
  "tax",
  "service_fee",
  "tip",
  "discount",
  "rounding",
  "delivery_fee",
  "other",
]);

export const ProcessingRunStatusSchema = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const ReceiptProcessingRunSchema = z.object({
  id: z.number().int(),
  receipt_id: z.number().int(),
  provider: z.string(),
  status: ProcessingRunStatusSchema,
  error_message: z.string().nullable(),
  started_at: IsoDateTimeSchema.nullable(),
  completed_at: IsoDateTimeSchema.nullable(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
});

export const ReceiptImageSchema = z.object({
  id: z.number().int(),
  receipt_id: z.number().int(),
  position: z.number().int(),
  capture_type: z.string(),
  image_url: z.string().nullable(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
});

export const ReceiptSchema = z.object({
  id: z.number().int(),
  bill_id: z.number().int(),
  status: ReceiptStatusSchema,
  merchant_name: z.string().nullable(),
  receipt_date: z.string().nullable(),
  subtotal_cents: z.number().int(),
  total_cents: z.number().int(),
  currency: z.string(),
  tax_cents: z.number().int(),
  service_fee_cents: z.number().int(),
  tip_cents: z.number().int(),
  discount_cents: z.number().int(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
});

export const ReceiptItemSchema = z.object({
  id: z.number().int(),
  bill_id: z.number().int(),
  receipt_id: z.number().int().nullable(),
  name: z.string(),
  quantity: z.number(),
  unit_price_cents: z.number().int(),
  total_cents: z.number().int(),
  category: z.string().nullable(),
  icon_key: z.string().nullable(),
  position: z.number().int(),
  confidence: z.number().nullable(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
});

export const ReceiptAdjustmentSchema = z.object({
  id: z.number().int(),
  receipt_id: z.number().int(),
  label: z.string(),
  kind: ReceiptAdjustmentKindSchema,
  amount_cents: z.number().int(),
  affects_total: z.boolean(),
  position: z.number().int(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
});

export const ReceiptShowResponseSchema = z.object({
  receipt: ReceiptSchema,
  processing_run: ReceiptProcessingRunSchema.nullable(),
  receipt_items: z.array(ReceiptItemSchema).optional(),
  receipt_adjustments: z.array(ReceiptAdjustmentSchema).optional(),
});

export type ReceiptStatus = z.infer<typeof ReceiptStatusSchema>;
export type ReceiptAdjustmentKind = z.infer<typeof ReceiptAdjustmentKindSchema>;
export type ProcessingRunStatus = z.infer<typeof ProcessingRunStatusSchema>;
export type ReceiptProcessingRun = z.infer<typeof ReceiptProcessingRunSchema>;
export type ReceiptImage = z.infer<typeof ReceiptImageSchema>;
export type Receipt = z.infer<typeof ReceiptSchema>;
export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;
export type ReceiptAdjustment = z.infer<typeof ReceiptAdjustmentSchema>;
export type ReceiptShowResponse = z.infer<typeof ReceiptShowResponseSchema>;
