export const billRoomQueryKeys = {
  all: ["bill-room"] as const,
  detail: (billId: number) =>
    [...billRoomQueryKeys.all, "detail", billId] as const,
};
