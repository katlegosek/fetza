import { z } from "zod";

import { IsoDateTimeSchema } from "@/services/api-common.schema";
import { BillSummaryResponseSchema } from "@/services/bills/bill-summary.schema";

export const BillParticipantSchema = z.object({
  id: z.number().int(),
  bill_id: z.number().int(),
  name: z.string(),
  initials: z.string().nullable(),
  avatar_background_color: z.string().nullable(),
  avatar_text_color: z.string().nullable(),
  seat_index: z.number().int().nullable(),
  is_host: z.boolean(),
  settled: z.boolean(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
});

export const ParticipantMutationResponseSchema = z.object({
  participant: BillParticipantSchema,
  bill_summary: BillSummaryResponseSchema,
});

export const ParticipantDeleteResponseSchema =
  ParticipantMutationResponseSchema;

export type BillParticipant = z.infer<typeof BillParticipantSchema>;
export type ParticipantMutationResponse = z.infer<
  typeof ParticipantMutationResponseSchema
>;
export type ParticipantDeleteResponse = z.infer<
  typeof ParticipantDeleteResponseSchema
>;
