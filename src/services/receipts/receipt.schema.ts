import { z } from "zod";

import { IsoDateTimeSchema } from "@/services/api-common.schema";
import { BillSummaryResponseSchema } from "@/services/bills/bill-summary.schema";
import { ReceiptItemSchema } from "@/services/receipts/receipt-item.schema";
import {
  ProcessingRunStatusSchema,
  ReceiptAdjustmentKindSchema,
  ReceiptStatusSchema,
} from "@/services/receipts/receipt.enums.schema";

export {
  ProcessingRunStatusSchema,
  ReceiptAdjustmentKindSchema,
  ReceiptStatusSchema,
} from "@/services/receipts/receipt.enums.schema";
export type {
  ProcessingRunStatus,
  ReceiptAdjustmentKind,
  ReceiptStatus,
} from "@/services/receipts/receipt.enums.schema";
export { ReceiptItemSchema } from "@/services/receipts/receipt-item.schema";
export type { ReceiptItem } from "@/services/receipts/receipt-item.schema";

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

export const ReceiptStatusPayloadSchema = z.object({
  id: z.number().int(),
  status: ReceiptStatusSchema,
});

export const ReceiptItemMutationResponseSchema = z.object({
  receipt_item: ReceiptItemSchema,
  bill_summary: BillSummaryResponseSchema,
});

export const ReceiptItemDeleteResponseSchema =
  ReceiptItemMutationResponseSchema;

export const ReceiptAdjustmentMutationResponseSchema = z.object({
  receipt_adjustment: ReceiptAdjustmentSchema,
  bill_summary: BillSummaryResponseSchema,
});

export const ReceiptAdjustmentDeleteResponseSchema =
  ReceiptAdjustmentMutationResponseSchema;

export const ReceiptImageUploadResponseSchema = z.object({
  receipt: ReceiptStatusPayloadSchema,
  receipt_image: ReceiptImageSchema,
  processing_run: ReceiptProcessingRunSchema,
});

export type ReceiptProcessingRun = z.infer<typeof ReceiptProcessingRunSchema>;
export type ReceiptImage = z.infer<typeof ReceiptImageSchema>;
export type Receipt = z.infer<typeof ReceiptSchema>;
export type ReceiptAdjustment = z.infer<typeof ReceiptAdjustmentSchema>;
export type ReceiptShowResponse = z.infer<typeof ReceiptShowResponseSchema>;
export type ReceiptStatusPayload = z.infer<typeof ReceiptStatusPayloadSchema>;
export type ReceiptItemMutationResponse = z.infer<
  typeof ReceiptItemMutationResponseSchema
>;
export type ReceiptItemDeleteResponse = z.infer<
  typeof ReceiptItemDeleteResponseSchema
>;
export type ReceiptAdjustmentMutationResponse = z.infer<
  typeof ReceiptAdjustmentMutationResponseSchema
>;
export type ReceiptAdjustmentDeleteResponse = z.infer<
  typeof ReceiptAdjustmentDeleteResponseSchema
>;
export type ReceiptUploadResponse = z.infer<
  typeof ReceiptImageUploadResponseSchema
>;
