import { useQuery } from "@tanstack/react-query";

import { billQueryKeys, getBillSummary } from "@/api/billApi";

export function useBillSummary(billId: number) {
  return useQuery({
    queryKey: billQueryKeys.summary(billId),
    queryFn: () => getBillSummary(billId),
    enabled: billId > 0,
  });
}
