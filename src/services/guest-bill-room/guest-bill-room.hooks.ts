import { useMutation, useQuery } from "@tanstack/react-query";

import { guestBillRoomQueryKeys } from "@/services/guest-bill-room/guest-bill-room.keys";
import guestBillRoomService from "@/services/guest-bill-room/guest-bill-room.service";

export const useGuestBillRoom = (shareToken: string) =>
  useQuery({
    queryKey: guestBillRoomQueryKeys.detail(shareToken),
    queryFn: () => guestBillRoomService.getRoom(shareToken),
    enabled: shareToken.length > 0,
    refetchInterval: (query) =>
      query.state.data?.bill.session_status === "open" ? 5_000 : false,
  });

export const useJoinGuestBillRoom = () =>
  useMutation({
    mutationFn: ({
      shareToken,
      name,
    }: {
      shareToken: string;
      name: string;
    }) => guestBillRoomService.joinRoom(shareToken, name),
  });

export const useRenameGuestBillRoomGuest = () =>
  useMutation({
    mutationFn: ({
      shareToken,
      name,
    }: {
      shareToken: string;
      name: string;
    }) => guestBillRoomService.renameGuest(shareToken, name),
  });

export const useLeaveGuestBillRoom = () =>
  useMutation({
    mutationFn: (shareToken: string) =>
      guestBillRoomService.leaveRoom(shareToken),
  });

export const useClaimGuestBillRoomItem = () =>
  useMutation({
    mutationFn: ({
      shareToken,
      receiptItemId,
      claimed,
    }: {
      shareToken: string;
      receiptItemId: number;
      claimed: boolean;
    }) =>
      claimed
        ? guestBillRoomService.unclaimItem(shareToken, receiptItemId)
        : guestBillRoomService.claimItem(shareToken, receiptItemId),
  });
