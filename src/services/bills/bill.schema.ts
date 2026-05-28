import { z } from "zod";

import { IsoDateTimeSchema } from "@/services/api-common.schema";
import { ItemAssignmentSchema } from "@/services/assignments/assignment.schema";
import {
  BillStatusSchema,
  BillSummaryResponseSchema,
} from "@/services/bills/bill-summary.schema";
import { BillParticipantSchema } from "@/services/participants/participant.schema";
import {
  ReceiptAdjustmentSchema,
  ReceiptItemSchema,
  ReceiptSchema,
} from "@/services/receipts/receipt.schema";

export {
  BillStatusSchema,
  BillSummaryAdjustmentSchema,
  BillSummaryBillSchema,
  BillSummaryParticipantSchema,
  BillSummaryResponseSchema,
  BillSummaryTotalsSchema,
} from "@/services/bills/bill-summary.schema";

export type {
  BillStatus,
  BillSummary,
  BillSummaryAdjustment,
  BillSummaryBill,
  BillSummaryParticipant,
  BillSummaryTotals,
} from "@/services/bills/bill-summary.schema";

export const BillIndexItemSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  status: BillStatusSchema,
  total_cents: z.number().int(),
  participants_count: z.number().int(),
  receipt_name: z.string(),
  receipt_date: z.string().nullable(),
  created_at: IsoDateTimeSchema,
});

export const BillListResponseSchema = z.object({
  bills: z.array(BillIndexItemSchema),
});

export const BillDetailSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  status: BillStatusSchema,
  total_cents: z.number().int(),
  receipt_name: z.string(),
  receipt_date: z.string().nullable(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
});

export const BillShowResponseSchema = z.object({
  bill: BillDetailSchema,
  receipt: ReceiptSchema.nullable(),
  receipt_items: z.array(ReceiptItemSchema),
  receipt_adjustments: z.array(ReceiptAdjustmentSchema),
  bill_participants: z.array(BillParticipantSchema),
  item_assignments: z.array(ItemAssignmentSchema),
});

export const BillCreateResponseSchema = z.object({
  bill: BillDetailSchema,
});

export type { IsoDateTime } from "@/services/api-common.schema";
export type BillIndexItem = z.infer<typeof BillIndexItemSchema>;
export type BillsIndexResponse = z.infer<typeof BillListResponseSchema>;
export type BillDetail = z.infer<typeof BillDetailSchema>;
export type BillShowResponse = z.infer<typeof BillShowResponseSchema>;
export type BillCreateResponse = z.infer<typeof BillCreateResponseSchema>;
