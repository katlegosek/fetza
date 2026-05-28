export const receiptQueryKeys = {
  all: ["receipts"] as const,
  details: () => [...receiptQueryKeys.all, "detail"] as const,
  detail: (receiptId: number) =>
    [...receiptQueryKeys.details(), receiptId] as const,
};
