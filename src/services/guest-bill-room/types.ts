import type { z } from "zod";

import type {
  GuestBillRoomBillSchema,
  GuestBillRoomResponseSchema,
} from "@/services/guest-bill-room/guest-bill-room.schema";

export type GuestBillRoomBill = z.infer<typeof GuestBillRoomBillSchema>;
export type GuestBillRoomResponse = z.infer<typeof GuestBillRoomResponseSchema>;
