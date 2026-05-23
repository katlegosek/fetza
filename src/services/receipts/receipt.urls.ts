const billsBase = "/bills";
const receiptsBase = "/receipts";
const receiptItemsBase = "/receipt_items";
const receiptAdjustmentsBase = "/receipt_adjustments";

export default {
  receipt: (receiptId: number) => `${receiptsBase}/${receiptId}`,
  billReceiptImages: (billId: number) =>
    `${billsBase}/${billId}/receipt_images`,
  billReceiptItems: (billId: number) => `${billsBase}/${billId}/receipt_items`,
  receiptItem: (receiptItemId: number) =>
    `${receiptItemsBase}/${receiptItemId}`,
  receiptAdjustments: (receiptId: number) =>
    `${receiptsBase}/${receiptId}/adjustments`,
  receiptAdjustment: (adjustmentId: number) =>
    `${receiptAdjustmentsBase}/${adjustmentId}`,
};
