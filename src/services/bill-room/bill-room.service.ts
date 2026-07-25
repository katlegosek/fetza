import networkService from "@/api/network-service";
import { parseBillRoomResponse } from "@/services/bill-room/bill-room.model";
import billRoomUrls from "@/services/bill-room/bill-room.urls";
import type { BillRoomResponse } from "@/services/bill-room/types";

const getBillRoom = async (billId: number): Promise<BillRoomResponse> => {
  const data = await networkService.get<unknown>(billRoomUrls.room(billId));
  return parseBillRoomResponse(data);
};

const confirmBillRoom = async (billId: number): Promise<BillRoomResponse> => {
  const data = await networkService.post<unknown>(billRoomUrls.confirm(billId));
  return parseBillRoomResponse(data);
};

const finalizeBillRoom = async (billId: number): Promise<BillRoomResponse> => {
  const data = await networkService.post<unknown>(
    billRoomUrls.finalize(billId),
  );
  return parseBillRoomResponse(data);
};

export default {
  getBillRoom,
  confirmBillRoom,
  finalizeBillRoom,
};
