import { z } from "zod";

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

export type ReceiptStatus = z.infer<typeof ReceiptStatusSchema>;
export type ReceiptAdjustmentKind = z.infer<typeof ReceiptAdjustmentKindSchema>;
export type ProcessingRunStatus = z.infer<typeof ProcessingRunStatusSchema>;
