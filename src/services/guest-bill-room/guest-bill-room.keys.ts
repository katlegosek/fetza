export const guestBillRoomQueryKeys = {
  all: ["guest-bill-room"] as const,
  detail: (shareToken: string) =>
    [...guestBillRoomQueryKeys.all, shareToken] as const,
};
