const billsBase = "/bills";

export default {
  room: (billId: number) => `${billsBase}/${billId}/room`,
  confirm: (billId: number) => `${billsBase}/${billId}/confirm`,
  finalize: (billId: number) => `${billsBase}/${billId}/finalize`,
};
