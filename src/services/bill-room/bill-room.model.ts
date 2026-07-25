import { parseApiResponse } from "@/api/parse-api-response";
import { BillRoomResponseSchema } from "@/services/bill-room/bill-room.schema";
import type { BillRoomResponse } from "@/services/bill-room/types";

export const parseBillRoomResponse = (data: unknown): BillRoomResponse =>
  parseApiResponse(BillRoomResponseSchema, data);
