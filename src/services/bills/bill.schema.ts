import { z } from "zod";

import { ItemAssignmentSchema } from "@/services/assignments/assignment.schema";
import { IsoDateTimeSchema } from "@/services/assignments/assignment.schema";
import { BillParticipantSchema } from "@/services/participants/participant.schema";
import {
  ReceiptAdjustmentKindSchema,
  ReceiptAdjustmentSchema,
  ReceiptItemSchema,
  ReceiptSchema,
} from "@/services/receipts/receipt.schema";

export const BillStatusSchema = z.enum([
  "draft",
  "active",
  "completed",
  "archived",
]);

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

export const BillSummaryBillSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  status: BillStatusSchema,
  total_cents: z.number().int(),
  items_count: z.number().int(),
  assigned_items_count: z.number().int(),
  unassigned_items_count: z.number().int(),
});

export const BillSummaryTotalsSchema = z.object({
  bill_total_cents: z.number().int(),
  assigned_total_cents: z.number().int(),
  unassigned_total_cents: z.number().int(),
  settled_total_cents: z.number().int(),
  outstanding_total_cents: z.number().int(),
});

export const BillSummaryParticipantSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  initials: z.string().nullable(),
  avatar_background_color: z.string().nullable(),
  avatar_text_color: z.string().nullable(),
  seat_index: z.number().int().nullable(),
  is_host: z.boolean(),
  settled: z.boolean(),
  amount_due_cents: z.number().int(),
  assigned_items_count: z.number().int(),
});

export const BillSummaryAdjustmentSchema = z.object({
  id: z.number().int(),
  label: z.string(),
  kind: ReceiptAdjustmentKindSchema,
  amount_cents: z.number().int(),
  affects_total: z.boolean(),
  position: z.number().int(),
});

export const BillSummaryResponseSchema = z.object({
  bill: BillSummaryBillSchema,
  totals: BillSummaryTotalsSchema,
  participants: z.array(BillSummaryParticipantSchema),
  receipt_adjustments: z.array(BillSummaryAdjustmentSchema),
});

export const BillShowResponseSchema = z.object({
  bill: BillDetailSchema,
  receipt: ReceiptSchema.nullable(),
  receipt_items: z.array(ReceiptItemSchema),
  receipt_adjustments: z.array(ReceiptAdjustmentSchema),
  bill_participants: z.array(BillParticipantSchema),
  item_assignments: z.array(ItemAssignmentSchema),
});

export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;
export type BillStatus = z.infer<typeof BillStatusSchema>;
export type BillIndexItem = z.infer<typeof BillIndexItemSchema>;
export type BillsIndexResponse = z.infer<typeof BillListResponseSchema>;
export type BillDetail = z.infer<typeof BillDetailSchema>;
export type BillSummaryBill = z.infer<typeof BillSummaryBillSchema>;
export type BillSummaryTotals = z.infer<typeof BillSummaryTotalsSchema>;
export type BillSummaryParticipant = z.infer<
  typeof BillSummaryParticipantSchema
>;
export type BillSummaryAdjustment = z.infer<typeof BillSummaryAdjustmentSchema>;
export type BillSummary = z.infer<typeof BillSummaryResponseSchema>;
export type BillShowResponse = z.infer<typeof BillShowResponseSchema>;
