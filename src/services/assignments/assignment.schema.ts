import { z } from "zod";

export const IsoDateTimeSchema = z.string();

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

export type SplitMethod = z.infer<typeof SplitMethodSchema>;
export type ItemAssignment = z.infer<typeof ItemAssignmentSchema>;
