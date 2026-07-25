import publicNetworkService from "@/api/public-network-service";
import { parseGuestBillRoomResponse } from "@/services/guest-bill-room/guest-bill-room.model";
import guestBillRoomUrls from "@/services/guest-bill-room/guest-bill-room.urls";
import {
  clearGuestToken,
  getGuestToken,
  setGuestToken,
} from "@/services/guest-bill-room/guest-token.storage";
import type { GuestBillRoomResponse } from "@/services/guest-bill-room/types";

const getRoom = async (shareToken: string): Promise<GuestBillRoomResponse> => {
  const guestToken = getGuestToken(shareToken);
  const data = await publicNetworkService.get<unknown>(
    guestBillRoomUrls.room(shareToken),
    guestToken,
  );
  const room = parseGuestBillRoomResponse(data);

  if (guestToken && !room.current_participant_id) {
    clearGuestToken(shareToken);
  }

  return room;
};

const joinRoom = async (
  shareToken: string,
  name: string,
): Promise<GuestBillRoomResponse> => {
  const data = await publicNetworkService.post<
    unknown,
    { guest: { name: string } }
  >(guestBillRoomUrls.join(shareToken), { guest: { name } });
  const room = parseGuestBillRoomResponse(data);

  if (!room.guest_token) {
    throw new Error("The bill room did not return a guest token.");
  }

  setGuestToken(shareToken, room.guest_token);
  return room;
};

const claimItem = async (
  shareToken: string,
  receiptItemId: number,
): Promise<GuestBillRoomResponse> => {
  const data = await publicNetworkService.post<unknown>(
    guestBillRoomUrls.claim(shareToken, receiptItemId),
    undefined,
    getGuestToken(shareToken),
  );
  return parseGuestBillRoomResponse(data);
};

const unclaimItem = async (
  shareToken: string,
  receiptItemId: number,
): Promise<GuestBillRoomResponse> => {
  const data = await publicNetworkService.delete<unknown>(
    guestBillRoomUrls.claim(shareToken, receiptItemId),
    getGuestToken(shareToken),
  );
  return parseGuestBillRoomResponse(data);
};

export default {
  getRoom,
  joinRoom,
  claimItem,
  unclaimItem,
};
