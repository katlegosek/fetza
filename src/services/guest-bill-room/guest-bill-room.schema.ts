import { z } from "zod";

import { ItemAssignmentSchema } from "@/services/assignments/assignment.schema";
import { BillRoomSessionStatusSchema } from "@/services/bill-room/bill-room.schema";
import { BillParticipantSchema } from "@/services/participants/participant.schema";
import { ReceiptItemSchema } from "@/services/receipts/receipt.schema";

export const GuestBillRoomBillSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  session_status: BillRoomSessionStatusSchema,
  total_cents: z.number().int(),
  currency: z.string(),
});

export const GuestBillRoomResponseSchema = z.object({
  bill: GuestBillRoomBillSchema,
  receipt_items: z.array(ReceiptItemSchema),
  participants: z.array(BillParticipantSchema),
  item_assignments: z.array(ItemAssignmentSchema),
  current_participant_id: z.number().int().nullable(),
  guest_token: z.string().optional(),
});
