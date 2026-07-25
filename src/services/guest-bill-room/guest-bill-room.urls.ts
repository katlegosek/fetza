const roomsBase = "/bill_rooms";

export default {
  room: (shareToken: string) => `${roomsBase}/${shareToken}`,
  join: (shareToken: string) => `${roomsBase}/${shareToken}/join`,
  claim: (shareToken: string, receiptItemId: number) =>
    `${roomsBase}/${shareToken}/items/${receiptItemId}/claim`,
};
