export const receiptEndpoints = {
  receipt: (receiptId: number) => `/receipts/${receiptId}`,
  billReceiptImages: (billId: number) => `/bills/${billId}/receipt_images`,
  billReceiptItems: (billId: number) => `/bills/${billId}/receipt_items`,
  receiptItem: (receiptItemId: number) => `/receipt_items/${receiptItemId}`,
  receiptAdjustments: (receiptId: number) =>
    `/receipts/${receiptId}/adjustments`,
  receiptAdjustment: (adjustmentId: number) =>
    `/receipt_adjustments/${adjustmentId}`,
} as const;
