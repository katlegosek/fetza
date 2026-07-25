import { z } from "zod";

import { ItemAssignmentSchema } from "@/services/assignments/assignment.schema";
import { BillStatusSchema } from "@/services/bills/bill-summary.schema";
import { BillParticipantSchema } from "@/services/participants/participant.schema";
import {
  ReceiptAdjustmentSchema,
  ReceiptItemSchema,
  ReceiptSchema,
} from "@/services/receipts/receipt.schema";

export const BillRoomSessionStatusSchema = z.enum([
  "draft",
  "open",
  "finalized",
  "closed",
]);

export const BillRoomBillSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  status: BillStatusSchema,
  session_status: BillRoomSessionStatusSchema,
  share_token: z.string().nullable(),
  share_url: z.string().nullable(),
  confirmed_at: z.string().nullable(),
  finalized_at: z.string().nullable(),
  total_cents: z.number().int(),
  receipt_name: z.string(),
  receipt_date: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const BillRoomResponseSchema = z.object({
  bill: BillRoomBillSchema,
  receipt: ReceiptSchema.nullable(),
  receipt_items: z.array(ReceiptItemSchema),
  receipt_adjustments: z.array(ReceiptAdjustmentSchema),
  bill_participants: z.array(BillParticipantSchema),
  item_assignments: z.array(ItemAssignmentSchema),
});
