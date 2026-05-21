/** Compatibility barrel — prefer @/services imports for new code. */
export { billQueryKeys } from "@/services/bills/bill.keys";
export {
  createBill,
  getBill,
  getBillSummary,
  getBills,
} from "@/services/bills/bill.service";
export { receiptQueryKeys } from "@/services/receipts/receipt.hooks";
export {
  createReceiptAdjustment,
  createReceiptItem,
  deleteReceiptAdjustment,
  deleteReceiptItem,
  getReceipt,
  updateReceiptAdjustment,
  updateReceiptItem,
  uploadReceiptImage,
} from "@/services/receipts/receipt.service";
export {
  createParticipant,
  deleteParticipant,
  updateParticipant,
} from "@/services/participants/participant.service";
export {
  clearBillAssignments,
  clearReceiptItemAssignments,
  replaceReceiptItemAssignments,
  splitAllEqually,
  splitUnassignedEqually,
} from "@/services/assignments/assignment.service";
