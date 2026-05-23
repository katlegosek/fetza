import { useMemo } from "react";

import { billShowToAssignData } from "@/screens/assign/mappers/bill-to-assign";
import { useBill, useBillSummary } from "@/services/bills/bill.hooks";

export const useAssignApiData = (billId: number) => {
  const billQuery = useBill(billId);
  const summaryQuery = useBillSummary(billId);

  const apiAssignData = useMemo(
    () => (billQuery.data ? billShowToAssignData(billQuery.data) : null),
    [billQuery.data],
  );

  const isLoading = billQuery.isLoading || summaryQuery.isLoading;
  const isError = billQuery.isError || summaryQuery.isError;
  const loadError = billQuery.error ?? summaryQuery.error;

  return {
    billData: billQuery.data,
    summaryData: summaryQuery.data,
    apiAssignData,
    isLoading,
    isError,
    loadError,
    refetchBill: billQuery.refetch,
    refetchSummary: summaryQuery.refetch,
  };
};
