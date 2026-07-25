const roomsBase = "/bill_rooms";

export default {
  room: (shareToken: string) => `${roomsBase}/${shareToken}`,
  join: (shareToken: string) => `${roomsBase}/${shareToken}/join`,
  guest: (shareToken: string) => `${roomsBase}/${shareToken}/guest`,
  claim: (shareToken: string, receiptItemId: number) =>
    `${roomsBase}/${shareToken}/items/${receiptItemId}/claim`,
};
