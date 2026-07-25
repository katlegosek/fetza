import { parseApiResponse } from "@/api/parse-api-response";
import { GuestBillRoomResponseSchema } from "@/services/guest-bill-room/guest-bill-room.schema";
import type { GuestBillRoomResponse } from "@/services/guest-bill-room/types";

export const parseGuestBillRoomResponse = (
  data: unknown,
): GuestBillRoomResponse => parseApiResponse(GuestBillRoomResponseSchema, data);
