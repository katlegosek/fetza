import { useQuery } from "@tanstack/react-query";

import { billQueryKeys } from "@/services/bills/bill.keys";
import billService from "@/services/bills/bill.service";

export const useBills = () =>
  useQuery({
    queryKey: billQueryKeys.list(),
    queryFn: billService.getBills,
  });

export const useBill = (billId: number) =>
  useQuery({
    queryKey: billQueryKeys.detail(billId),
    queryFn: () => billService.getBill(billId),
    enabled: billId > 0,
  });

export const useBillSummary = (billId: number) =>
  useQuery({
    queryKey: billQueryKeys.summary(billId),
    queryFn: () => billService.getBillSummary(billId),
    enabled: billId > 0,
  });
