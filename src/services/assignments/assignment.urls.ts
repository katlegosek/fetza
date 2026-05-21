export const assignmentUrls = {
  receiptItemAssignments: (receiptItemId: number) =>
    `/receipt_items/${receiptItemId}/assignments`,
  splitAllEqually: (billId: number) => `/bills/${billId}/split_all_equally`,
  splitUnassignedEqually: (billId: number) =>
    `/bills/${billId}/split_unassigned_equally`,
  billAssignments: (billId: number) => `/bills/${billId}/assignments`,
} as const;
