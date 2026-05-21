export const billQueryKeys = {
  all: ["bills"] as const,
  lists: () => [...billQueryKeys.all, "list"] as const,
  list: () => billQueryKeys.lists(),
  details: () => [...billQueryKeys.all, "detail"] as const,
  detail: (billId: number) => [...billQueryKeys.details(), billId] as const,
  summaries: () => [...billQueryKeys.all, "summary"] as const,
  summary: (billId: number) => [...billQueryKeys.summaries(), billId] as const,
};
