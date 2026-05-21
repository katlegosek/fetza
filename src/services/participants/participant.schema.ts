import { z } from "zod";

import { IsoDateTimeSchema } from "@/services/assignments/assignment.schema";

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

export type BillParticipant = z.infer<typeof BillParticipantSchema>;
