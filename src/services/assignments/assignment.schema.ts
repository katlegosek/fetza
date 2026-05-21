import { z } from "zod";

import { IsoDateTimeSchema } from "@/services/api-common.schema";
import { BillSummaryResponseSchema } from "@/services/bills/bill-summary.schema";

export { IsoDateTimeSchema } from "@/services/api-common.schema";
export type { IsoDateTime } from "@/services/api-common.schema";

export const SplitMethodSchema = z.enum(["equal", "custom"]);

export const ItemAssignmentSchema = z.object({
  id: z.number().int(),
  receipt_item_id: z.number().int(),
  bill_participant_id: z.number().int(),
  amount_cents: z.number().int(),
  split_method: SplitMethodSchema,
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
});

export const BulkAssignmentResponseSchema = z.object({
  bill_summary: BillSummaryResponseSchema,
});

export type SplitMethod = z.infer<typeof SplitMethodSchema>;
export type ItemAssignment = z.infer<typeof ItemAssignmentSchema>;
export type BulkAssignmentMutationResponse = z.infer<
  typeof BulkAssignmentResponseSchema
>;
