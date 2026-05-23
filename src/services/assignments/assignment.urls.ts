const billsBase = "/bills";
const receiptItemsBase = "/receipt_items";

export default {
  receiptItemAssignments: (receiptItemId: number) =>
    `${receiptItemsBase}/${receiptItemId}/assignments`,
  splitAllEqually: (billId: number) =>
    `${billsBase}/${billId}/split_all_equally`,
  splitUnassignedEqually: (billId: number) =>
    `${billsBase}/${billId}/split_unassigned_equally`,
  billAssignments: (billId: number) => `${billsBase}/${billId}/assignments`,
};
