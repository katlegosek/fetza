import type { z } from "zod";

import type {
  BillRoomBillSchema,
  BillRoomResponseSchema,
  BillRoomSessionStatusSchema,
} from "@/services/bill-room/bill-room.schema";

export type BillRoomSessionStatus = z.infer<typeof BillRoomSessionStatusSchema>;
export type BillRoomBill = z.infer<typeof BillRoomBillSchema>;
export type BillRoomResponse = z.infer<typeof BillRoomResponseSchema>;
