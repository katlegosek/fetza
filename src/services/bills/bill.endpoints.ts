export const billEndpoints = {
  bills: () => "/bills",
  bill: (billId: number) => `/bills/${billId}`,
  billSummary: (billId: number) => `/bills/${billId}/summary`,
} as const;
