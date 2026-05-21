import { useQuery } from "@tanstack/react-query";

import { billQueryKeys } from "@/services/bills/bill.keys";
import {
  getBill,
  getBillSummary,
  getBills,
} from "@/services/bills/bill.service";

export function useBills() {
  return useQuery({
    queryKey: billQueryKeys.list(),
    queryFn: getBills,
  });
}

export function useBill(billId: number) {
  return useQuery({
    queryKey: billQueryKeys.detail(billId),
    queryFn: () => getBill(billId),
    enabled: billId > 0,
  });
}

export function useBillSummary(billId: number) {
  return useQuery({
    queryKey: billQueryKeys.summary(billId),
    queryFn: () => getBillSummary(billId),
    enabled: billId > 0,
  });
}
