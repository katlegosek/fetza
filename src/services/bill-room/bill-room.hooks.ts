import { useMutation, useQuery } from "@tanstack/react-query";

import { billRoomQueryKeys } from "@/services/bill-room/bill-room.keys";
import billRoomService from "@/services/bill-room/bill-room.service";

export const useBillRoom = (billId: number) =>
  useQuery({
    queryKey: billRoomQueryKeys.detail(billId),
    queryFn: () => billRoomService.getBillRoom(billId),
    enabled: billId > 0,
  });

export const useConfirmBillRoom = () =>
  useMutation({
    mutationFn: (billId: number) => billRoomService.confirmBillRoom(billId),
  });

export const useFinalizeBillRoom = () =>
  useMutation({
    mutationFn: (billId: number) => billRoomService.finalizeBillRoom(billId),
  });
