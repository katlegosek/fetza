import { useQuery } from "@tanstack/react-query";

import { billQueryKeys, getBill } from "@/api/billApi";

export function useBill(billId: number) {
  return useQuery({
    queryKey: billQueryKeys.detail(billId),
    queryFn: () => getBill(billId),
    enabled: billId > 0,
  });
}
