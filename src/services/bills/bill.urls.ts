const baseUrl = "/bills";

export default {
  bills: () => baseUrl,
  bill: (billId: number) => `${baseUrl}/${billId}`,
  billSummary: (billId: number) => `${baseUrl}/${billId}/summary`,
};
