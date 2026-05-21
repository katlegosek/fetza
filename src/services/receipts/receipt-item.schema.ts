import { z } from "zod";

import { IsoDateTimeSchema } from "@/services/api-common.schema";

export const ReceiptItemSchema = z.object({
  id: z.number().int(),
  bill_id: z.number().int(),
  receipt_id: z.number().int().nullable(),
  name: z.string(),
  quantity: z.number(),
  unit_price_cents: z.number().int(),
  total_cents: z.number().int(),
  category: z.string().nullable(),
  icon_key: z.string().nullable(),
  position: z.number().int(),
  confidence: z.number().nullable(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
});

export type ReceiptItem = z.infer<typeof ReceiptItemSchema>;
